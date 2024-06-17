import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/Users';
import { Posts } from './entities/Posts';
import { Comments } from './entities/Comments';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { PostViews } from './entities/PostViews';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      host: '3.39.250.35',
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      entities: [Users, Posts, PostViews, Comments],
      keepConnectionAlive: true,
      migrations: [__dirname + '/migrations/*.ts'],
      charset: 'utf8mb4_general_ci',
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
