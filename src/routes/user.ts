import { NextFunction, Request, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";
// import { Op } from 'sequelize';
import { sign, check } from '../jwt';
import qs from 'qs';
import passport from 'passport';
import * as passportKakao from 'passport-kakao';
import * as passportGoogle from 'passport-google-oauth20';

const router = express.Router();

const { KAKAO_KEY, KAKAO_SECRET, CLIENT_URL, GOOGLE_KEY, GOOGLE_SECRET } = process.env;

const { user } = sequelize.models;

// strategy.
const KakaoStrategy = passportKakao.Strategy;
const GoogleStrategy = passportGoogle.Strategy;

// passport kakao strategy.
passport.use(new KakaoStrategy({
  clientID: KAKAO_KEY as string,
  clientSecret: KAKAO_SECRET as string,
  callbackURL: `/user/kakao/callback`
}, (accessToken, refreshToken, profile, done) => {
  if(!profile?._json?.kakao_account?.email) {
    return done("카카오 계정이 없습니다.");
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
    return done("구글 계정이 없습니다.");
  }

  return done(null, profile._json.email);
}));

// kakao auth.
router.get("/kakao", passport.authenticate('kakao', { session: false }));

// non rest ful api. kakao callback.
router.get("/kakao/callback", passport.authenticate('kakao', { session: false, failureRedirect: `${CLIENT_URL}/#/login?state=failed` }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.user;

    if(!email) {
      throw new Error("해당 카카오 계정이 없거나 잘못되었습니다.");
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
    }

    const token = sign({ id: userData.getDataValue("id") });

    if(!token) {
      throw new Error("사용자 로그인 중 에러가 발생했습니다. 다시 시도해주세요.");
    }

    const query = {
      state: "success",
      token
    }

    return res.redirect(`${CLIENT_URL}/#/login?${qs.stringify(query)}`);
  } catch(err) {
    console.log(err);
    return res.redirect(`${CLIENT_URL}/#/login?state=failed`);
  }
});

// google auth.
router.get("/google", passport.authenticate('google', { session: false }));

// non rest ful api. google callback.
router.get("/google/callback", passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/#/login?state=failed` }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.user;

    if(!email) {
      throw new Error("해당 구글 계정이 없거나 잘못되었습니다.");
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
    }

    const token = sign({ id: userData.getDataValue("id") });

    if(!token) {
      throw new Error("사용자 로그인 중 에러가 발생했습니다. 다시 시도해주세요.");
    }

    const query = {
      state: "success",
      token
    }

    return res.redirect(`${CLIENT_URL}/#/login?${qs.stringify(query)}`);
  } catch(err) {
    console.log(err);
    return res.redirect(`${CLIENT_URL}/#/login?state=failed`);
  }
});

// non rest ful api. kakao login & google login & stelling login logout.
router.post("/logout", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;

    if(!id) {
      throw new Error("사용자 아이디가 없습니다.");
    }

    const userData: Model<any, any> | null = await user.findOne({ where: { id } });

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
          id
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

export default router;