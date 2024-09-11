import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_DB!, process.env.POSTGRES_USER!, process.env.POSTGRES_PASSWORD!, {
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  dialect: 'postgres',
  dialectOptions: {
    connectTimeout: 60000 // Increase the connection timeout
  },
  pool: {
    max: 20, // Increase the maximum number of connections
    min: 0,
    acquire: 60000, // Increase the acquire timeout (in milliseconds)
    idle: 10000
  }
});

export default sequelize;