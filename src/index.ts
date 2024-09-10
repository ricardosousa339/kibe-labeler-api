import WebSocket from 'ws';
import sequelize from './database';
import PostService from './services/postService';
import Post from './models/Post';
import {
  ComAtprotoSyncSubscribeRepos,
  SubscribeReposMessage,
  subscribeRepos,
} from 'atproto-firehose'

const client = subscribeRepos(`wss://bsky.network`, { decodeRepoOps: true })
const postService = new PostService();
let postCount = 0;
const POST_LIMIT = process.env.POST_LIMIT ? parseInt(process.env.POST_LIMIT) : 100;

// Sincronizar o banco de dados
sequelize.sync().then(() => {
  console.log('Database synced');
});

client.on('open', () => {
  // console.log('Connected to ws://localhost:6008/subscribe');
  // client.send('Hello from client');
});




client.on('message', (m: SubscribeReposMessage) => {
  if (ComAtprotoSyncSubscribeRepos.isCommit(m)) {
    m.ops.forEach(async (op) => {

      const type = (op?.payload as any)?.$type;

      if(type === 'app.bsky.feed.post') {

        const text = (op?.payload as any)?.text;

        console.log(text)

      await postService.addPost(text);
      postCount++;



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
    })
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