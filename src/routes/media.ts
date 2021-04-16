import { NextFunction, Response } from "express";
import express from 'express';
import sequelize from '../sequelize';
import { Model } from "sequelize/types";
import { objCheck, uploader, s3DeleteObject } from '../utils';
import { check } from '../jwt';

const router = express.Router();

const { media, page, group, user } = sequelize.models;

// media all api.
router.get("/", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { pageId } = req.query;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    if(!pageId) {
      return next({ s: 200, m: "페이지 아이디가 없습니다." });
    }

    const data: Model<any, any>[] = await media.findAll({
      include: [
        {
          model: page,
          required: true,
          include: [
            {
              model: group,
              required: true,
              include: [
                {
                  model: user,
                  required: true,
                  where: {
                    id: userId
                  }
                }
              ]
            }
          ]
        }
      ],
      where: {
        pageId
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

// media one api.
router.get("/one", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { id } = req.query;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    if(!id) {
      return next({ s: 200, m: "아이디가 없습니다." });
    }

    const data: Model<any, any> | null = await media.findOne({
      include: [
        {
          model: page,
          required: true,
          include: [
            {
              model: group,
              required: true,
              include: [
                {
                  model: user,
                  required: true,
                  where: {
                    id: userId
                  }
                }
              ]
            }
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

// media add api.
router.post("/", check, uploader("pages").single("image"), async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { name, pageId } = req.body;
    const { key, mimetype, originalname, location } = req.file;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }
    
    const checkIf = objCheck({ pageId, name, key, originalname, mimetype, location });

    if(checkIf) {
      console.log(checkIf);

      if(key) {
        s3DeleteObject(key);
      }

      throw new Error("필수값이 없거나 파일이 없습니다.");
    }

    const data: Model<any, any> | null = await sequelize.transaction( async (transaction) => {
      return await media.create({
        name,
        url: location,
        type: mimetype,
        pageId
      }, {
        transaction
      });
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

// media delete api.
router.delete("/", check, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { id, pageId } = req.query;

    if(!userId) {
      throw new Error("유저 아이디가 없습니다.");
    }

    if(!id && !pageId) {
      return next({ s: 200, m: "아이디와 페이지 아이디가 둘 다 없습니다." });
    }

    if(id) {
      const data: Model<any, any> | null = await media.findOne({
        include: [
          {
            model: page,
            required: true,
            include: [
              {
                model: group,
                required: true,
                include: [
                  {
                    model: user,
                    required: true,
                    where: {
                      id: userId
                    }
                  }
                ]
              }
            ]
          }
        ],
        where: {
          id
        }
      });

      if(!data) {
        return next({ s: 200, m: "해당 아이디의 미디어가 없습니다." });
      }

      s3DeleteObject(data.getDataValue("url"));

      await sequelize.transaction( async (transaction) => {
        await media.destroy({
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
    }

    if(pageId) {
      const data: Model<any, any>[] = await media.findAll({
        include: [
          {
            model: page,
            required: true,
            include: [
              {
                model: group,
                required: true,
                include: [
                  {
                    model: user,
                    required: true,
                    where: {
                      id: userId
                    }
                  }
                ]
              }
            ]
          }
        ],
        where: {
          pageId
        }
      });

      if(!data) {
        return next({ s: 200, m: "해당 아이디의 미디어가 없습니다." });
      }

      const mapDelete = data.map(rows => {
        return s3DeleteObject(rows.getDataValue("url"));
      });

      await Promise.all(mapDelete);

      await sequelize.transaction( async (transaction) => {
        await media.destroy({
          where: {
            pageId
          },
          transaction
        });
      });

      return res.status(200).send({
        result: true,
        data: "성공적으로 삭제되었습니다."
      });
    }

    return res.status(200).send({
      result: true,
      data: null
    });
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

export default router;