import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostCategory, Posts } from 'src/entities/Posts';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/uploads/uploads-aws-s3.service';
import { PostViews } from 'src/entities/PostViews';
import { CommentsService } from 'src/comments/comments.service';
import { UserRoleType, Users } from 'src/entities/Users';
import { SearchPostDto } from './dto/search-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,
    @InjectRepository(PostViews)
    private postViewsRepository: Repository<PostViews>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private awsS3Service: AwsS3Service,
    private commentsService: CommentsService,
    private dataSource: DataSource,
  ) {}

  // private adminRoleCheck(role: UserRoleType, category: PostCategory) {
  //   if (category === PostCategory.NOTICE && role !== UserRoleType.ADMIN) {
  //     throw new UnauthorizedException('공지사항은 관리자만 작성이 가능합니다.');
  //   }
  // }
  async createPost(
    userId: number,
    createPostDto: CreatePostDto,
    image?: Express.Multer.File,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('해당 아이디의 유저를 찾을 수 없습니다.');
    }

    // 관리자 체크
    if (
      createPostDto.category === PostCategory.NOTICE &&
      user.role !== UserRoleType.ADMIN
    ) {
      throw new UnauthorizedException('공지사항은 관리자만 작성이 가능합니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const post = new Posts();

      post.title = createPostDto.title;
      post.content = createPostDto.content;
      post.category = createPostDto.category;
      post.user = user;
      await queryRunner.manager.getRepository(Posts).save(post);

      if (image) {
        const imgUrl = await this.awsS3Service.uploadFileToS3('postImg', image);
        post.imgUrl = imgUrl;
      }
      await queryRunner.commitTransaction();
      return post;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`게시물 업로드 실패: ${error}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getAllPosts(): Promise<Posts[]> {
    return await this.postsRepository
      .createQueryBuilder('post')
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.nickname'])
      .where('post.deletedAt is NULL')
      .getMany();
  }

  async getAllPostsByCategory(category: PostCategory) {
    try {
      return await this.postsRepository
        .createQueryBuilder('post')
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.nickname'])
        .where('post.category = :category', { category })
        .andWhere('post.deletedAt is NULL')
        .getMany();
    } catch (error) {
      throw new NotFoundException(`조회 실패 errror: ${error}`);
    }
  }

  async getAllPostsByViewsAndPeriod(period: string): Promise<Posts[]> {
    const now = new Date();
    let dateFilter: Date;

    switch (period) {
      case 'year':
        dateFilter = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );
        break;
      case 'month':
        dateFilter = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
        break;
      case 'week':
        dateFilter = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7,
        );
        break;
      case 'all':
      default:
        dateFilter = new Date(0);
        break;
    }

    return await this.postsRepository
      .createQueryBuilder('post')
      .leftJoin('post.postViews', 'postView')
      .leftJoinAndSelect('post.user', 'user')
      .addSelect(['user.id', 'user.username'])
      .where('postView.viewedAt >= :dateFilter', { dateFilter })
      .andWhere('post.deletedAt IS NULL')
      .groupBy('post.id')
      .orderBy('COUNT(postView.id)', 'DESC')
      .getMany();
  }

  async getPostById(id: number): Promise<Posts> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.nickname'])
      .where('post.id = :id', { id })
      .getOne();
    if (!post || post.deletedAt) {
      throw new NotFoundException(`해당 글이 존재하지 않습니다.`);
    }
    return post;
  }

  // 글 상세 조회
  async getPostByIdForViewing(id: number): Promise<Posts> {
    //! query 수정 필요 parents?
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comment')
      .leftJoinAndSelect('comment.user', 'commentUser')
      .leftJoinAndSelect('comment.children', 'childComment')
      .leftJoinAndSelect('childComment.user', 'childCommentUser')
      .leftJoinAndSelect('post.user', 'user')
      .addSelect([
        'user.nickname',
        'commentUser.nickname',
        'childCommentUser.nickname',
      ])
      .where('post.id = :id', { id })
      .andWhere('post.deletedAt IS NULL')
      .andWhere('comment.deletedAt IS NULL')
      .andWhere('childComment.deletedAt IS NULL')
      .getOne();

    if (!post || post.deletedAt) {
      throw new NotFoundException(`해당 글이 존재하지 않습니다.`);
    }
    // 조회수 증가
    post.views += 1;
    await this.postsRepository.save(post);

    const postView = await this.postViewsRepository.create({ post });
    await this.postViewsRepository.save(postView);

    // 댓글 데이터를 계층 구조로 만들어 보낸다
    post.comments = this.commentsService.buildCommentsHierarchy(post.comments);

    return post;
  }

  async searchPosts(searchPostDto: SearchPostDto): Promise<Posts[]> {
    const { total, title, author } = searchPostDto;
    console.log(searchPostDto);

    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.nickname']);

    if (total) {
      queryBuilder
        .where('post.title LIKE :total', { total: `%${total}%` })
        .orWhere('user.nickname LIKE :total', { total: `%${total}%` });
    } else {
      if (title) {
        queryBuilder.andWhere('post.title LIKE :title', {
          title: `%${title}%`,
        });
      }
      if (author) {
        queryBuilder.andWhere('user.nickname LIKE :author', {
          author: `%${author}%`,
        });
      }
    }
    try {
      return await queryBuilder.getMany();
    } catch (error) {
      throw new BadRequestException('검색 실패');
    }
  }

  async updatePost(
    id: number,
    userId: number,
    userRole: UserRoleType,
    updatePostDto: UpdatePostDto,
  ): Promise<Posts> {
    const post = await this.getPostById(id);
    if (userRole !== UserRoleType.ADMIN && post.user.id !== userId) {
      throw new UnauthorizedException('글 수정 권한이 없습니다.');
    }
    const newPost = {
      ...post,
      ...updatePostDto,
    };
    try {
      return await this.postsRepository.save(newPost);
    } catch (error) {
      throw new BadRequestException('글 수정 실패');
    }
  }

  async deletePost(
    id: number,
    userId: number,
    userRole: UserRoleType,
  ): Promise<void> {
    const post = await this.getPostById(id);
    if (userRole !== UserRoleType.ADMIN && post.user.id !== userId) {
      throw new UnauthorizedException('글 삭제 권한이 없습니다.');
    }
    try {
      await this.postsRepository.softRemove(post);
    } catch (error) {
      throw new BadRequestException('글 삭제 실패');
    }
    // await this.awsS3Service.deleteImage(post.imageUrl);
  }
}
