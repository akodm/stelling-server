import { NextFunction, Request, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";
// import { check } from '../jwt';

const router = express.Router();

const { page, user, group, media } = sequelize.models;

// page all api.
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.query;

    if(!groupId) {
      return next({ s: 200, m: "선택된 그룹이 없습니다." });
    }

    const data: Model<any, any>[] = await page.findAll({
      include: [{ 
        model: group, include: [{ 
          model: user, attributes: ["id", "name"] 
        }]
      },
      {
        model: media
      }],
      where: {
        groupId
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

// page one api.
router.get("/one", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    const data: Model<any, any> | null = await page.findOne({
      include: [
        { 
          model: group, include: [{ 
            model: user, attributes: ["id", "name"] 
          }]
        },
        {
          model: media
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

// page add api.
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.body;

    if(!groupId) {
      return next({ s: 200, m: "선택된 그룹이 없습니다." });
    }

    const data = await sequelize.transaction( async (transaction) => {
      const item = await page.create({
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

// page update api.
router.put("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body;

    if(!id) {
      return next({ s: 200, m: "페이지 아이디가 비어있습니다." });
    }

    await sequelize.transaction( async (transaction) => {
      await page.update({
        ...req.body
      }, {
        where: {
          id
        },
        transaction
      });
    });

    const data = await page.findOne({
      include: [{ 
        model: group, include: [{ 
          model: user, attributes: ["id", "name"] 
        }]
      },
      {
        model: media
      }],
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

// page delete api.
router.delete("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;

    if(!id) {
      return next({ s: 200, m: "아이디가 비어있습니다." });
    }

    await sequelize.transaction( async (transaction) => {
      await page.destroy({
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