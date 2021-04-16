import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize';

export interface GroupAttributes {
  id: number;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export interface GroupModel extends Model<GroupAttributes>, GroupAttributes {};
export class Group extends Model<GroupModel, GroupAttributes> {};
export type GroupStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): GroupModel;
};

export const groupTable = (sequelize: Sequelize): GroupStatic => {
  return <GroupStatic>sequelize.define('group', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(20),      // 제목
    },
  },
  {
    freezeTableName: true
  });
};