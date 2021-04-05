import { NextFunction, Request, Response } from "express";
import express from 'express';

const router = express.Router();

// index route api.
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.query;

    if(!text) {
      return next({ s: 200, m: "text is undefined" });
    }

    return res.send(`Hello Express ! ${text ?? ""}`); 
  } catch(err) {
    err.status = err.status ?? 500;

    return next(err);
  }
});

export default router;