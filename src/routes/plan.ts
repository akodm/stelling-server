import { NextFunction, Request, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";
import { check } from '../jwt';
import { objCheck } from '../utils';

const router = express.Router();

const { plan, user, schedule } = sequelize.models;

// plan all api.
router.get("/", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;

    if(!userId) {
      return next({ s: 200, m: "유저 아이디가 비어있습니다." });
    }

    const data: Model<any, any>[] = await plan.findAll({
      include: [
        { model: user, attributes: ["id", "name"] },
        { model: schedule }
      ],
      where: {
        userId
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

// plan one api.
router.get("/one", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    const data: Model<any, any> | null = await plan.findOne({
      include: [
        { model: user, attributes: ["id", "name"] },
        { model: schedule }
      ],
      where: {
        id
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

// plan add api.
router.post('/', check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end, userId } = req.body;

    const reqCheck = objCheck({ start, end, userId });

    if(reqCheck) {
      console.log(reqCheck);
      return next({ s: 200, m: `비어있는 값이 있습니다.` });
    }

    const data = await sequelize.transaction( async (transaction) => {
      const item = await plan.create({
        ...req.body,
      }, { 
        transaction 
      });

      return item;
    });

    return res.status(201).send({
      result: true,
      data
    });
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

// plan update api.
router.put("/", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end, id } = req.body;

    const reqCheck = objCheck({ start, end, id });

    if(reqCheck) {
      console.log(reqCheck);
      return next({ s: 200, m: `비어있는 값이 있습니다.` });
    }

    await sequelize.transaction( async (transaction) => {
      await plan.update({
        ...req.body
      }, {
        where: {
          id
        },
        transaction
      });
    });

    const data = await plan.findOne({
      include: [
        { model: user, attributes: ["id", "name"] },
        { model: schedule }
      ],
      where: {
        id
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

// plan delete api.
router.delete("/", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    await sequelize.transaction( async (transaction) => {
      await plan.destroy({
        where: {
          id
        },
        transaction
      })
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