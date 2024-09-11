import WebSocket from 'ws';
import sequelize from './database';
import PostService from './services/postService';
import cron from 'node-cron';
import {
  ComAtprotoSyncSubscribeRepos,
  SubscribeReposMessage,
  subscribeRepos,
} from 'atproto-firehose'
import errorLogger from './services/errorLogger';
import syncCacheToDatabase from './services/syncJob';

const client = subscribeRepos(`wss://bsky.network`, { decodeRepoOps: true })
const postService = new PostService();
let postCount = 0;
const POST_LIMIT = process.env.POST_LIMIT ? parseInt(process.env.POST_LIMIT) : 100;


// Agendar o job para rodar a cada hora
cron.schedule('0 * * * *', () => {
  console.log('Running sync job...');
  syncCacheToDatabase();
});


// Sincronizar o banco de dados
sequelize.sync().then(() => {
  console.log('Database synced');
});

client.on('open', () => {
  console.log('Connected to ws://localhost:6008/subscribe');
  // client.send('Hello from client');
});




client.on('message', (m: SubscribeReposMessage) => {
  if (ComAtprotoSyncSubscribeRepos.isCommit(m)) {
    m.ops.forEach(async (op) => {

      try {

        const type = (op?.payload as any)?.$type;

        if (type === 'app.bsky.feed.post') {

          const text = (op?.payload as any)?.text;

          // console.log(text)

          if (text.length > process.env.MIN_TEXT_LENGTH! && text.length < 255) {
            await postService.addPost(text);
            postCount++;

          }

          if (postCount >= POST_LIMIT) {


            // const topPosts = await postService.getTopPosts(50);
            // console.log('Top posts:', topPosts.map(post => `${post.content}: ${post.count}`));
            client.close();
            // await Post.destroy({ where: {}, truncate: true });
            console.log('Database truncated');
            postCount = 0;
          }

        }
        // console.log(op.payload)
      }
      catch (e: any) {
        errorLogger.error(`Error adding post: ${e?.message}`);
      }
    }
    )
  }
})





// client.on('message', async (data: WebSocket.Data) => {
//   try {
//     const message = JSON.parse(data.toString());

//     const commit = message.commit;


//     if (commit && commit.collection === 'app.bsky.feed.post' && commit.record?.text?.length > process.env.MIN_TEXT_LENGTH!) {
//       // await postService.addPost(commit.record.text);
//       postCount++;
//       console.log(`Received from server: ${JSON.stringify(message, null, 2)}`);


//     }
//   } catch (error) {
//     console.error('Error parsing JSON:', error);
//   }

//   if (postCount >= POST_LIMIT) {


//     // const topPosts = await postService.getTopPosts(50);
//     // console.log('Top posts:', topPosts.map(post => `${post.content}: ${post.count}`));
//     client.close();
//     // await Post.destroy({ where: {}, truncate: true });
//     console.log('Database truncated');
//     postCount = 0;
//   }
// });

// TODO: Implementar a lógica de verificar mídias
// TODO: Ignorar hashtags
client.on('close', () => {
  console.log('Disconnected from ws://localhost:6008/subscribe');
});

client.on('error', (error) => {
  console.error(`WebSocket error: ${error}`);
});

console.log('WebSocket client is running');