import sequelize from '../database';
import Post from '../models/Post';
import { Op } from 'sequelize';

class PostService {
	async addPost(content: string) {

		content = content.substring(0, 255); // Ajuste o tamanho máximo do conteúdo conforme necessário

		if (content.length === 0) {
			console.log('Empty content');
			return;
		  }
	  const similarPosts = await Post.findAll({
		where: {
		  content: {
			[Op.iLike]: `%${content}%`
		  }
		},
		order: [
		  [sequelize.fn('similarity', sequelize.col('content'), content), 'DESC']
		],
		limit: 1
	  });
  
	if (similarPosts.length > 0 && (similarPosts[0] as Post).get('similarity') as number > 0.8) { // Ajuste o limiar de similaridade conforme necessário
		const similarPost = similarPosts[0];
		similarPost.count += 1;
		await similarPost.save();
	  } else {
		await Post.create({ content });
	  }
	}

  async getTopPosts(limit: number): Promise<Post[]> {
	return await Post.findAll({
	  order: [['count', 'DESC']],
	  limit
	});
  }

}

export default PostService;