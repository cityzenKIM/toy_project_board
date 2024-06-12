import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Users } from './src/entities/Users';
import { Posts } from './src/entities/Posts';
import { Comments } from './src/entities/Comments';

// typeorm-extension 설정 파일
dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Users, Posts, Comments],
  migrations: [__dirname + '/src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

export default dataSource;
