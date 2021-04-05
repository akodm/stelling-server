const { DataTypes } = require('sequelize');

module.exports = (sequelize: any) => {
  sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,      // 소셜 로그인 이메일
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,      // 설정 닉네임
    },
    profile: {
      type: DataTypes.STRING,      // 프로필 사진
    },
  },
  {
    freezeTableName: true
  });
};