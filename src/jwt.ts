import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Model } from 'sequelize/types';
import sequelize from './sequelize';

const { user } = sequelize.models;

const { EXPIRE = "30m", JWT_KEY } = process.env;

// random str generator.
export const randonStr = () => {
  const str = Math.random().toString(36).substr(2,8);

  return str;
};

// jwt token sign.
export const sign = (param: {}) => {
  try {
    const payload = {
      ...param,
      salt: randonStr()
    };

    const token = jwt.sign(payload, JWT_KEY as string, { expiresIn: EXPIRE });
  
    if(!token) {
      throw new Error("jwt generator err.");
    }

    const result = `Bearer ${token}`;
  
    return result;
  } catch(err) {
    console.log("jwt sign error.", err.message || err);
    return false;
  }
};

// jwt token verify.
export const verify = (token: string) => {
  try {
    const value = token.split("Bearer")[1].trim();

    const result = jwt.verify(value, JWT_KEY as string);

    if(!result) {
      throw new Error("token expire.");
    }

    return result;
  } catch(err) {
    console.log("jwt expire.", err.message || err);
    return false;
  }
};

// user token check function.
export const check = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req?.headers["authorization"];

    if(!token) {
      return next({ s: 401, m: "unauthrization." });
    }

    const value =  token.split("Bearer")[1].trim();

    const result: any = jwt.verify(value, JWT_KEY as string);

    if(!result || !result.userId) {
      return next({ s: 401, m: "unauthrization." });
    }

    const data: Model<any, any> | null = await user.findOne({
      where: {
        id: result.userId
      }
    });

    if(!data || !data.getDataValue("id")) {
      return next({ s: 403, m: "not exists user." });
    }

    req.user = { userId: data.getDataValue("id") };

    return next();
  } catch(err) {
    err.status = err.message === "invalid token" ? 401 : err.status;
    err.status = err.message === "jwt expired" ? 200 : err.status;
    err.status = err.message === "invalid signature" ? 401 : err.status;

    return next(err);
  }
};

/**
 * str(). random string generator function.
 * sign(json object..). jwt generator function.
 * verify(token string..). jwt verify function.
 */