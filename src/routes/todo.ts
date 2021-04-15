import { NextFunction, Request, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";
import { check } from '../jwt';
import { objCheck } from '../utils';

const router = express.Router();

const { todo, user } = sequelize.models;

// todo all api.
router.get("/", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;

    if(!userId) {
      return next({ s: 200, m: "유저 아이디가 비어있습니다." });
    }

    const data: Model<any, any>[] = await todo.findAll({
      include: [
        { model: user, attributes: ["id", "name"] },
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

// todo one api.
router.get("/one", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    const data: Model<any, any> | null = await todo.findOne({
      include: [
        { model: user, attributes: ["id", "name"] },
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

// todo add api.
router.post('/', check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, start, end, success } = req.body;

    const checkIf = objCheck({ userId, start, end, success });

    if(checkIf) {
      console.log(checkIf);
      return next({ s: 200, m: "비어있는 내용이 있습니다." });
    }
    
    const data = await sequelize.transaction( async (transaction) => {
      return await todo.create({
        ...req.body,
        userId
      }, { 
        transaction 
      });
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

// todo update api.
router.put("/", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, start, end, success } = req.body;

    const checkIf = objCheck({ id, start, end, success });

    if(checkIf) {
      console.log(checkIf)
      return next({ s: 200, m: "비어있는 내용이 있습니다." });
    }

    await sequelize.transaction( async (transaction) => {
      await todo.update({
        ...req.body
      }, {
        where: {
          id
        },
        transaction
      });
    });

    const data = await todo.findOne({
      include: [
        { model: user, attributes: ["id", "name"] },
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

// todo delete api.
router.delete("/", check, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    await sequelize.transaction( async (transaction) => {
      await todo.destroy({
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