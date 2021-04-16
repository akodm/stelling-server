import { NextFunction, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";
import { check } from '../jwt';
import { objCheck } from '../utils';

const router = express.Router();

const { todo, user } = sequelize.models;

// todo all api.
router.get("/", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    const data: Model<any, any>[] = await todo.findAll({
      include: [
        { model: user, attributes: ["id", "name"], where: {
          id: userId
        }, required: true },
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
router.get("/one", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { id } = req.query;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    const data: Model<any, any> | null = await todo.findOne({
      include: [
        { model: user, attributes: ["id", "name"], where: {
          id: userId
        }, required: true },
      ],
      where: {
        id,
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

// todo add api.
router.post('/', check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { start, end, success } = req.body;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    const checkIf = objCheck({ start, end, success });

    if(checkIf) {
      console.log(checkIf);
      return next({ s: 200, m: "비어있는 내용이 있습니다." });
    }
    
    const data: Model<any, any> | null = await sequelize.transaction( async (transaction) => {
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
router.put("/", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { id, start, end, success } = req.body;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    const checkIf = objCheck({ id, start, end, success });

    if(checkIf) {
      console.log(checkIf)
      return next({ s: 200, m: "비어있는 내용이 있습니다." });
    }

    const find: Model<any, any> | null = await todo.findOne({
      include: [
        { model: user, attributes: ["id", "name"], where: {
          id: userId
        }, required: true },
      ],
      where: {
        id
      }
    });

    if(!find || find.getDataValue("id").toString() !== id.toString()) {
      return next({ s: 401, m: "데이터가 없거나 해당 사용자의 데이터가 아닙니다." });
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

    const data: Model<any, any> | null = await todo.findOne({
      include: [
        { model: user, attributes: ["id", "name"], where: {
          id: userId
        }, required: true },
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
router.delete("/", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { id } = req.query;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    const data: Model<any, any> | null = await todo.findOne({
      include: [
        {
          model: user, 
          attributes: ["id", "name"],
          where: {
            id: userId
          },
          required: true
        }
      ],
      where: {
        id,
        userId
      }
    }); 

    if(!data || data.getDataValue("id").toString() !== id.toString()) {
      return next({ s: 401, m: "데이터가 없거나 해당 사용자의 데이터가 아닙니다." });
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