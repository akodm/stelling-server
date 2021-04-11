import { NextFunction, Request, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";

const router = express.Router();

const { user } = sequelize.models;

// test user api.
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Model<any, any>[] = await user.findAll({});

    return res.status(200).send({
      result: true,
      data,
    }); 
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

export default router;