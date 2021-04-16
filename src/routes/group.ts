import { NextFunction, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";
import { check } from '../jwt';

const router = express.Router();

const { group, user, page, media } = sequelize.models;

// group all api.
router.get("/", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    const data: Model<any, any>[] = await group.findAll({
      include: [
        { 
          model: user, 
          attributes: ["id", "name"], 
          where: {
            id: userId
          },
          required: true
        },
        { model: page, include: [{
          model: media
        }] }
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

// group one api.
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

    const data: Model<any, any> | null = await group.findOne({
      include: [
        { model: user, attributes: ["id", "name"], where: {
          id: userId
        }, required: true },
        { model: page, include: [{
          model: media
        }] }
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

// group add api.
router.post('/', check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }
    
    const data: Model<any, any> | null = await sequelize.transaction( async (transaction) => {
      return await group.create({
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

// group update api.
router.put("/", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { id } = req.body;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    if(!id) {
      return next({ s: 200, m: "선택된 그룹이 없습니다." });
    }

    const find: Model<any, any> | null = await group.findOne({
      include: [
        { model: user, attributes: ["id", "name"], where: {
          id: userId
        }, required: true },
        { model: page, include: [{
          model: media
        }] }
      ],
      where: {
        id
      }
    });

    if(!find || find.getDataValue("id").toString() !== id.toString()) {
      return next({ s: 401, m: "데이터가 없거나 해당 사용자의 데이터가 아닙니다." });
    }

    await sequelize.transaction( async (transaction) => {
      await group.update({
        ...req.body
      }, {
        where: {
          id,
          userId
        },
        transaction
      });
    });

    const data: Model<any, any> | null = await group.findOne({
      include: [
        { model: user, attributes: ["id", "name"], where: {
          id: userId
        }, required: true },
        { model: page, include: [{
          model: media
        }] }
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

// group delete api.
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

    const data: Model<any, any> | null = await group.findOne({
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
      await group.destroy({
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