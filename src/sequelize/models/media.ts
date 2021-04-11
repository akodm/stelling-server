import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize';

export interface MediaAttributes {
  id: number;
  name: string;
  url: string;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export interface MediaModel extends Model<MediaAttributes>, MediaAttributes {};
export class Media extends Model<MediaModel, MediaAttributes> {};
export type MediaStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): MediaModel;
};

export const mediaTable = (sequelize: Sequelize): MediaStatic => {
  return <MediaStatic>sequelize.define('media', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,      // 파일명
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,      // 파일 주소
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING(10),      // 파일 타입
      allowNull: false,
    },
  },
  {
    freezeTableName: true
  });
};