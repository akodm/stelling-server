import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize';

export interface PageAttributes {
  id: number;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export interface PageModel extends Model<PageAttributes>, PageAttributes {};
export class Page extends Model<PageModel, PageAttributes> {};
export type PageStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): PageModel;
};

export const pageTable = (sequelize: Sequelize): PageStatic => {
  return <PageStatic>sequelize.define('page', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,      // 제목
    },
    content: {
      type: DataTypes.TEXT,      // 내용
    }
  },
  {
    freezeTableName: true
  });
};