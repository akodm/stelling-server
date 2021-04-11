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
export const tokenCheck = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req?.headers["authorization"];

    if(!token) {
      throw new Error("unauthrization.");
    }

    const value =  token.split("Bearer")[1].trim();

    const result: any = jwt.verify(value, JWT_KEY as string);

    if(!result || !result.id) {
      throw new Error("unauthrization.");
    }

    const data: Model<any, any> | null = await user.findOne({
      where: {
        id: result.id
      }
    });

    if(!data || !data.getDataValue("id")) {
      throw new Error("not exists user.");
    }

    req.user = { id: data.getDataValue("id") };

    return next();
  } catch(err) {
    return next(err);
  }
};

/**
 * str(). random string generator function.
 * sign(json object..). jwt generator function.
 * verify(token string..). jwt verify function.
 */