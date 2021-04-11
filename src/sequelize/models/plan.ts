import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize';

export interface PlanAttributes {
  id: number;
  start: string;
  end: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export interface PlanModel extends Model<PlanAttributes>, PlanAttributes {};
export class Plan extends Model<PlanModel, PlanAttributes> {};
export type PlanStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): PlanModel;
};

export const planTable = (sequelize: Sequelize): PlanStatic => {
  return <PlanStatic>sequelize.define('plan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
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