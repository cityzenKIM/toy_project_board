import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from 'src/entities/Comments';
import { Posts } from 'src/entities/Posts';
import { Users } from 'src/entities/Users';

@Module({
  imports: [TypeOrmModule.forFeature([Comments, Posts, Users])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
