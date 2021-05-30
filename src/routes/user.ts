import { NextFunction, Request, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";
import { sign, check } from '../jwt';
import { uploader, s3DeleteObject } from '../utils';
import qs from 'qs';
import passport from 'passport';
import * as passportKakao from 'passport-kakao';
import * as passportGoogle from 'passport-google-oauth20';
import axios from "axios";

const router = express.Router();

const { KAKAO_KEY, KAKAO_SECRET, CLIENT_URL, GOOGLE_KEY, GOOGLE_SECRET } = process.env;

const { user, memo } = sequelize.models;

const FAILED_REDIRECT_PATH = `${CLIENT_URL}?state=failed`;

// strategy.
const KakaoStrategy = passportKakao.Strategy;
const GoogleStrategy = passportGoogle.Strategy;

// passport kakao strategy.
passport.use(new KakaoStrategy({
  clientID: KAKAO_KEY as string,
  clientSecret: KAKAO_SECRET as string,
  callbackURL: `/user/kakao/callback`
}, async (accessToken, refreshToken, profile, done) => {
  if(!profile?._json?.kakao_account?.email) {
    await axios.post(`https://kapi.kakao.com/v1/user/unlink`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return done(null, undefined);
  }

  return done(null, profile._json.kakao_account.email);
}));

// passport google strategy.
passport.use(new GoogleStrategy({
  clientID: GOOGLE_KEY as string,
  clientSecret: GOOGLE_SECRET as string,
  callbackURL: "/user/google/callback",
  scope: ["email"]
}, (accessToken, refreshToken, profile, done) => {
  if(!profile?._json?.email) {
    return done(null, undefined);
  }

  return done(null, profile._json.email);
}));

interface MemoInitType {
  err: boolean;
  message: string | undefined;
  data: Model<any, any> | null;
}

// user create & memo create.
const memoInitDb = async (userId: number) => {
  try {
    const data: Model<any, any> | null = await memo.create({
      content: "아직 메모가 없어요! 중요한 내용을 기록해보세요!",
      userId
    });

    if(!data || !data.getDataValue("id")) {
      console.log("사용자 아이디:", userId);
      throw new Error("메모가 정상적으로 생성되지 않았습니다. 사용자 아이디를 확인해주세요.");
    }

    return {
      err: false,
      message: "",
      data
    };
  } catch(err) {
    return {
      err: true,
      message: err.message || "",
      data: null
    };
  }
};

// kakao auth.
router.get("/kakao", passport.authenticate('kakao', { session: false }));

// non rest ful api. kakao callback.
router.get("/kakao/callback", passport.authenticate('kakao', { session: false, failureRedirect: FAILED_REDIRECT_PATH }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.user;

    if(!email || email === undefined) {
      return res.redirect(302, FAILED_REDIRECT_PATH);
    }

    let userData: Model<any, any> | null = await user.findOne({ 
      where: { 
        email, 
        type: "kakao"
      } 
    });

    if(!userData) {
      userData = await user.create({
        email,
        type: "kakao",
        login: "Y"
      });

      const memoResult: MemoInitType = await memoInitDb(userData.getDataValue("id"));

      if(memoResult.err) {
        throw new Error(memoResult.message);
      }
    }

    const token: string | false = sign({ userId: userData.getDataValue("id") });

    if(!token) {
      throw new Error("사용자 로그인 중 에러가 발생했습니다. 다시 시도해주세요.");
    }

    const query = {
      state: "success",
      token
    }

    return res.redirect(`${CLIENT_URL}?${qs.stringify(query)}`);
  } catch(err) {
    console.log(err);
    return res.redirect(302, FAILED_REDIRECT_PATH);
  }
});

// google auth.
router.get("/google", passport.authenticate('google', { session: false }));

// non rest ful api. google callback.
router.get("/google/callback", passport.authenticate('google', { session: false, failureRedirect: FAILED_REDIRECT_PATH }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.user;

    if(!email || email === undefined) {
      return res.redirect(302, FAILED_REDIRECT_PATH);
    }

    let userData: Model<any, any> | null = await user.findOne({ 
      where: { 
        email, 
        type: "google"
      } 
    });

    if(!userData) {
      userData = await user.create({
        email,
        type: "google",
        login: "Y"
      });

      const memoResult: MemoInitType = await memoInitDb(userData.getDataValue("id"));

      if(memoResult.err) {
        throw new Error(memoResult.message);
      }
    }

    const token: string | false = sign({ userId: userData.getDataValue("id") });

    if(!token) {
      throw new Error("사용자 로그인 중 에러가 발생했습니다. 다시 시도해주세요.");
    }

    const query = {
      state: "success",
      token
    }

    return res.redirect(`${CLIENT_URL}?${qs.stringify(query)}`);
  } catch(err) {
    console.log(err);
    return res.redirect(302, FAILED_REDIRECT_PATH);
  }
});

// non rest ful api. kakao login & google login & stelling login logout.
router.post("/logout", async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    if(!userId) {
      throw new Error("사용자 아이디가 없습니다.");
    }

    const userData: Model<any, any> | null = await user.findOne({ where: { id: userId } });

    if(!userData) {
      return next({ s: 200, m: "해당 사용자가 없습니다." });
    }

    if(userData.getDataValue("login") === "N") {
      return next({ s: 200, m: "현재 로그인 중인 사용자가 아닙니다." });
    }

    await sequelize.transaction( async (transaction) => {
      await user.update({
        login: "N"
      }, {
        where: {
          id: userId
        },
        transaction
      });
    });

    req.logout();

    res.status(200).send({
      result: true,
      data: "성공적으로 로그아웃 처리되었습니다."
    });
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

// user token extension api.
router.get("/token", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { reissue } = req.query;

    if(!userId) {
      throw new Error("사용자 아이디가 없습니다.");
    }

    const data: Model<any, any> | null = await user.findOne({
      attributes: ["id", "name", "profile", "login"],
      where: {
        id: userId
      }
    });

    let token: string | false = false;

    if(reissue) {
      token = sign({ userId });

      if(!token) {
        throw new Error("사용자 조회 중 에러가 발생했습니다. 다시 시도해주세요.");
      }
    }

    if(data && data.getDataValue("id")) {
      await sequelize.transaction( async (transaction) => {
        await user.update({
          login: "Y"
        }, {
          where: {
            id: userId
          },
          transaction
        });
      });
    }

    return res.status(200).send({
      result: true,
      token,
      data
    });
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

// user one api.
router.get("/one", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;

    if(!userId) {
      return next({ s: 200, m: "유저 아이디가 비어있습니다." });
    }

    const data: Model<any, any> | null = await user.findOne({ 
      attributes: ["id", "name", "profile"],
      where: { 
        id: userId
      } 
    });

    return res.status(200).send({
      result: true,
      data
    });
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

// user update api.
router.put("/", check, uploader("users").single("profile"), async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { name } = req.body;

    let key = req.file?.key;
    let location = req.file?.location;

    if(!userId) {
      if(key) {
        s3DeleteObject(key);
      }
      
      throw new Error("사용자 아이디가 없습니다.");
    }

    if(!name && !key) {
      return res.status(200).send({
        result: true,
        data: "변경된 내용이 없습니다."
      });
    }

    await sequelize.transaction( async (transaction) => {
      await user.update({
        ...req.body,
        profile: location
      }, {
        where: {
          id: userId
        },
        transaction
      });
    });

    const data: Model<any, any> | null = await user.findOne({
      attributes: ["id", "name", "profile"],
      where: {
        id: userId
      }
    });

    return res.status(200).send({
      result: true,
      data
    });
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

// user delete api.
router.delete("/", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;

    if(!userId) {
      throw new Error("사용자 아이디가 없습니다.");
    }

    await sequelize.transaction( async (transaction) => {
      await user.destroy({
        where: {
          id: userId
        },
        transaction
      });
    });

    return res.status(200).send({
      result: true,
      data: "성공적으로 삭제되었습니다."
    });
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

export default router;