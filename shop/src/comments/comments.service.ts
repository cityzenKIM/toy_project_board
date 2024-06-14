import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comments } from 'src/entities/Comments';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserRoleType, Users } from 'src/entities/Users';
import { Posts } from 'src/entities/Posts';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comments)
    private commentsRepository: Repository<Comments>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,
    private dataSource: DataSource,
  ) {}
  async createComment(userId: number, createCommentDto: CreateCommentDto) {
    const { content, postId, parentId } = createCommentDto;
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('해당 아이디의 유저를 찾을 수 없습니다.');
    }

    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('해당 글을 찾을 수 없습니다.');
    }

    const comment = new Comments();
    comment.content = content;
    comment.post = post;
    comment.user = user;

    if (parentId) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new NotFoundException(
          '대댓글을 작성할 댓글이 존재하지 않습니다.',
        );
      }
      // 부모 표시
      comment.parent = parentComment;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.getRepository(Comments).save(comment);

      await queryRunner.commitTransaction();
      return comment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`댓글 작성 실패 error: ${error} `);
    } finally {
      await queryRunner.release();
    }
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .addSelect(['user.id', 'user.nickname'])
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }
    return comment;
  }

  async getCommentsByPostId(postId: number) {
    try {
      const comments = await this.commentsRepository
        .createQueryBuilder('comment')
        .leftJoin('comment.user', 'user')
        .leftJoin('comment.parent', 'parentComment')
        .addSelect(['user.nickname', 'parentComment.id'])
        .where('comment.post.id = :postId', { postId })
        .withDeleted() // 댓글은 삭제 된 댓글도 가져온다
        .getMany();
      console.log(comments);

      // 계층 구조를 만들어 리턴
      return this.buildCommentsHierarchy(comments);
    } catch (error) {
      throw new BadRequestException('댓글 조회 실패');
    }
  }

  async updateComment(
    id: number,
    userId: number,
    userRole: UserRoleType,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.getCommentById(id);
    if (userRole !== UserRoleType.ADMIN && comment.user.id !== userId) {
      throw new UnauthorizedException('댓글 수정 권한이 없습니다.');
    }
    const newComment = {
      ...comment,
      ...updateCommentDto,
    };
    try {
      return await this.commentsRepository.save(newComment);
    } catch (error) {
      throw new BadRequestException('댓글 수정 실패');
    }
  }

  async deleteComment(id: number, userId: number, userRole: UserRoleType) {
    const comment = await this.getCommentById(id);
    if (userRole !== UserRoleType.ADMIN && comment.user.id !== userId) {
      throw new UnauthorizedException('댓글 삭제 권한이 없습니다.');
    }
    try {
      await this.commentsRepository.softRemove(comment);
    } catch (error) {
      throw new BadRequestException('글 삭제 실패');
    }
  }

  // 무작위 댓글 배열을 계층 구조로 만들어 주는 함수
  private buildCommentsHierarchy(comments: Comments[]): Comments[] {
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
}
