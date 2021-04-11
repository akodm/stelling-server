import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize';

export interface ScheduleAttributes {
  id: number;
  title: string;
  content: string;
  start: string;
  end: string;
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
      type: DataTypes.STRING,      // 제목
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,      // 내용
    },
    start: {
      type: DataTypes.STRING(20),      // 시작일
      allowNull: false,
    },
    end: {
      type: DataTypes.STRING(20),      // 종료일
      allowNull: false,
    },
  },
  {
    freezeTableName: true
  });
};