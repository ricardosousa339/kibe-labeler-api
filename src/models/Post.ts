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
    type: DataTypes.STRING(300), // Increase the maximum length to 1000 characters
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
  hooks: {
    afterSync: async (options) => {
      // Cria o índice de texto completo após a sincronização do modelo
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS posts_content_fulltext_idx ON "Posts" USING gin(to_tsvector('english', "content"));
      `);
    }
  }
});

export default Post;