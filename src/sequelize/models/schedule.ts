import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize';
import moment from 'moment';

export interface ScheduleAttributes {
  id: number;
  title: string;
  content: string;
  day: string;
  start: string;
  end: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
};
export interface ScheduleModel extends Model<ScheduleAttributes>, ScheduleAttributes {};
export class Schedule extends Model<ScheduleModel, ScheduleAttributes> {};
export type ScheduleStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): ScheduleModel;
};

export const scheduleTable = (sequelize: Sequelize): ScheduleStatic => {
  return <ScheduleStatic>sequelize.define('schedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(30),      // 제목
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,      // 내용
    },
    day: {
      type: DataTypes.STRING(20),           // 날짜 및 요일
      allowNull: false,
      defaultValue: moment().format("YYYY-MM-DD")
    },
    start: {
      type: DataTypes.STRING(20),      // 시작 시간
      allowNull: false,
      defaultValue: moment().format("HH:mm")
    },
    end: {
      type: DataTypes.STRING(20),      // 종료 시간
      allowNull: false,
      defaultValue: moment().format("HH:mm")
    },
  },
  {
    freezeTableName: true
  });
};