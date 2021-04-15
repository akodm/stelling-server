import { NextFunction, Request, Response } from "express";
import express from 'express';
import { dummyCreatorFunction } from '../utils/dummy';

const { ADMIN_KEY } = process.env;

const router = express.Router();

// index route api.
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.query;

    if(!text) {
      return next({ s: 200, m: "text is undefined" });
    }

    return res.status(200).send(`Hello Express ! ${text ?? ""}`); 
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

interface DummyResultType {
  err: boolean;
  message: string,
  data: any;
};

// dummy data creator api.
router.post("/dummy/all", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, userId } = req.body;

    if(!key || key !== ADMIN_KEY) {
      return next({ s: 401, m: "API 생성을 위한 키 값과 다릅니다." });
    } 

    if(!userId) {
      return next({ s: 200, m: "userId 가 필요합니다." });
    }

    const result: DummyResultType = await dummyCreatorFunction(userId);

    if(result.err) {
      throw new Error(result.message);
    }

    return res.status(200).send({
      result: true,
      text: result.message,
      data: result.data
    });
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

export default router;