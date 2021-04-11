import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize';

export interface TodoAttributes {
  id: number;
  content: string;
  start: string;
  end: string;
  success: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export interface TodoModel extends Model<TodoAttributes>, TodoAttributes {};
export class Todo extends Model<TodoModel, TodoAttributes> {};
export type TodoStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): TodoModel;
};

export const todoTable = (sequelize: Sequelize): TodoStatic => {
  return <TodoStatic>sequelize.define('todo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
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
    success: {
      type: DataTypes.STRING(1),      // 체크 여부
      allowNull: false,
    },
  },
  {
    freezeTableName: true
  });
};