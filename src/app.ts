import dotenv from 'dotenv';
dotenv.config();
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import indexRouter from './routes';
import userRouter from './routes/user';
import planRouter from './routes/plan';
import * as swaggerDocument from './swagger-empty.json';

const { CLIENT_URL, NODE_ENV } = process.env;

const app = express();
interface CorsType {
  origin: [string];
  optionsSuccessStatus?: number;
};

const corsOptions: CorsType = {
  origin: [CLIENT_URL as string],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https://www.gstatic.com"]
  }
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));  // static folder.
app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/plan", planRouter);
NODE_ENV === "development" && app.use("/swagger-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  // Route Not Found.
  next(createError(404));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  /**
   * Route API Error Handling.
   * throw new Error: x.
   * custom handling: return next({ s: statusCode, m: error message. });
   */

  const status = err.s ?? err.status ?? 500;
  const message = err.m ?? err.message ?? err;

  console.log(err);

  return res.status(status).send({
    result: false,
    data: null,
    message
  });
});

export default app;