import { NextFunction, Request, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";
import { objCheck } from '../utils';
import { check } from '../jwt';

const router = express.Router();

const { schedule, plan, user } = sequelize.models;

// schedule all api.
router.get("/", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.query;

    if(!planId) {
      return next({ s: 200, m: "플랜 아이디가 비어있습니다." });
    }

    const data: Model<any, any>[] = await schedule.findAll({
      include: [
        {
          model: plan, include: [
            { model: user, attributes: ["id", "name"] },
          ]
        }
      ],
      where: {
        planId
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

// schedule one api.
router.get("/one", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    const data: Model<any, any> | null = await schedule.findOne({
      include: [
        {
          model: plan, include: [
            { model: user, attributes: ["id", "name"] },
          ]
        }
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

// schedule add api.
router.post('/', check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId, title, start, end } = req.body;

    const checkIf = objCheck({ planId, title, start, end });

    if(checkIf) {
      console.log(checkIf);
      return next({ s: 200, m: "비어있는 내용이 있습니다." });
    }
    
    const data = await sequelize.transaction( async (transaction) => {
      const item = await schedule.create({
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

// schedule update api.
router.put("/", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, title, start, end } = req.body;

    const checkIf = objCheck({ id, title, start, end });

    if(checkIf) {
      console.log(checkIf);
      return next({ s: 200, m: "비어있는 내용이 있습니다." });
    }

    await sequelize.transaction( async (transaction) => {
      await schedule.update({
        ...req.body
      }, {
        where: {
          id
        },
        transaction
      });
    });

    const data = await schedule.findOne({
      include: [
        {
          model: plan, include: [
            { model: user, attributes: ["id", "name"] },
          ]
        }
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

// schedule delete api.
router.delete("/", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    await sequelize.transaction( async (transaction) => {
      await schedule.destroy({
        where: {
          id
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