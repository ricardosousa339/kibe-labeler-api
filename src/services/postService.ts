import Post from '../models/Post';
import { Sequelize } from 'sequelize';
import errorLogger from './errorLogger'; 
import redis from '../redis/redisClient';
import infoLogger from './infoLogger';

//TODO: Se o count de uma postagem for bem grande,já marcar ela como repetida

class PostService {
	async addPost(content: string) {
		content = content?.substring(0, 300); // Adjust the maximum content length as needed

		if (content?.length < parseFloat((process.env.MIN_CONTENT_LENGTH || '5')!)) {
			console.log('Empty content');
			return;
		}
		


		try {
			// Verifique se o post já está no cache
			const cachedCount = await redis.get(`post:${content}`);
			if (cachedCount) {
			  // Incrementa a contagem no cache
			  await redis.incr(`post:${content} <--> ${cachedCount}`);
			  infoLogger.info(`Post count incremented in cache for content: ${content}\nCount: ${cachedCount}`);
			} else {
			  // Execute as consultas em paralelo
			  const [existingPost, similarPost] = await Promise.all([
				Post.findOne({ where: { content } }),
				Post.findOne({
				  where: Sequelize.literal(`to_tsvector('english', "content") @@ plainto_tsquery('english', :query)`),
				  replacements: { query: content },
				  order: [
					[Sequelize.literal(`ts_rank_cd(to_tsvector('english', "content"), plainto_tsquery('english', :query))`), 'DESC']
				  ],
				  limit: 1
				})
			  ]);
	  
			  if (existingPost) {
				  existingPost.count += 1;
				  await existingPost.save();
				  // Armazena a contagem no cache
				  await redis.set(`post:${content}`, existingPost.count, 'EX', 3600); // Cache por 1 hora

				  infoLogger.info('info', `Post already exists: ${content} <--> ${existingPost}\nCount incremented: ${existingPost.count}`);
			  } else if (similarPost) {
				similarPost.count += 1;
				await similarPost.save();
				// Armazena a contagem no cache
				await redis.set(`post:${content}`, similarPost.count, 'EX', 3600); // Cache por 1 hora
				infoLogger.info(`Similar post found: ${content}<--> ${similarPost.content} \nCount incremented: ${similarPost.count}`);
			  } else {
				const newPost = await Post.create({ content });
				// Armazena a contagem no cache
				await redis.set(`post:${content}`, newPost.count, 'EX', 3600); // Cache por 1 hora
				
			  }
			}
		  } catch (error: any) {
			if (error.name === 'SequelizeTimeoutError') {
			  errorLogger.error(`Operation timeout: ${error.message}`);
			} else {
			  errorLogger.error(`Error adding post: ${error.message}`);
			}
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