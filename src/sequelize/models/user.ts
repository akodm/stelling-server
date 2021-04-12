import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize';

export interface UserAttributes {
  id: number;
  email: string;
  name: string;
  profile: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export interface UserModel extends Model<UserAttributes>, UserAttributes {};
export class User extends Model<UserModel, UserAttributes> {};
export type UserStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): UserModel;
};

export const userTable = (sequelize: Sequelize): UserStatic => {
  return <UserStatic>sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(50),       // 소셜 로그인 이메일
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(10),       // 설정 닉네임
    },
    profile: {
      type: DataTypes.STRING,           // 프로필 사진 주소
    },
    type: {
      type: DataTypes.STRING,           // 로그인 타입
      allowNull: false
    },
    login: {
      type: DataTypes.STRING,           // 현재 로그인 여부
      allowNull: false
    }
  },
  {
    freezeTableName: true
  });
};