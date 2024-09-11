import Redis from 'ioredis';
import Post from '../models/Post';
import infoLogger from './infoLogger';
import redis from '../redis/redisClient';


async function syncCacheToDatabase() {
  try {
    const keys = await redis.keys('post:*');
    for (const key of keys) {
      const content = key.split(':')[1];
      const count = await redis.get(key);
      if (count) {
        const post = await Post.findOne({ where: { content } });
        if (post) {
          post.count += parseInt(count, 10);
          await post.save();
        } else {
          await Post.create({ content, count: parseInt(count, 10) });
        }
        await redis.del(key);
        infoLogger.info(`Synchronized post with content: ${content} to database`);
      }
    }
  } catch (error) {
    infoLogger.error('Error synchronizing cache to database:', error);
  }
}

export default syncCacheToDatabase;