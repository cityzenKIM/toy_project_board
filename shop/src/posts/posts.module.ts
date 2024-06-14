import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from 'src/entities/Posts';
import { PostViews } from 'src/entities/PostViews';
import { AwsS3Service } from 'src/uploads/uploads-aws-s3.service';
import { CommentsService } from 'src/comments/comments.service';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/entities/Users';
import { Comments } from 'src/entities/Comments';

@Module({
  imports: [TypeOrmModule.forFeature([Posts, PostViews, Users, Comments])],
  controllers: [PostsController],
  providers: [PostsService, AwsS3Service, CommentsService, UsersService],
  exports: [PostsService],
})
export class PostsModule {}
