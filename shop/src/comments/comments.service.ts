import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comments } from 'src/entities/Comments';

@Injectable()
export class CommentsService {
  buildCommentsHierarchy(comments: Comments[]): Comments[] {
    const commentsMap = new Map<number, Comments>();
    const roots: Comments[] = [];

    comments.forEach((comment) => {
      commentsMap.set(comment.id, comment);
      comment.children = [];
    });

    comments.forEach((comment) => {
      if (comment.parent) {
        const parent = commentsMap.get(comment.parent.id);
        if (parent) {
          parent.children.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    return roots;
  }
  create(createCommentDto: CreateCommentDto) {
    return 'This action adds a new comment';
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
