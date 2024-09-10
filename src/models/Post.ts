import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';

class Post extends Model {
  public id!: number;
  public content!: string;
  public count!: number;
}

Post.init({
  id: {
	type: DataTypes.INTEGER,
	autoIncrement: true,
	primaryKey: true
  },
  content: {
	type: DataTypes.STRING,
	allowNull: false,
	unique: true
  },
  count: {
	type: DataTypes.INTEGER,
	allowNull: false,
	defaultValue: 1
  },
  // external_uri: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  //   defaultValue:''
  // }
}, {
  sequelize,
  tableName: 'posts',
  indexes: [
    {
      fields: ['content'],
      using: 'gin',
      operator: 'gin_trgm_ops'
    }
  ]
});

export default Post;