import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize';

export interface MemoAttributes {
  id: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export interface MemoModel extends Model<MemoAttributes>, MemoAttributes {};
export class Memo extends Model<MemoModel, MemoAttributes> {};
export type MemoStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): MemoModel;
};

export const memoTable = (sequelize: Sequelize): MemoStatic => {
  return <MemoStatic>sequelize.define('memo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT,      // 내용
    },
  },
  {
    freezeTableName: true
  });
};