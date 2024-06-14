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

      // postView 추가
      const postView = new PostViews();
      postView.post = post;
      await queryRunner.manager.getRepository(PostViews).save(postView);

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
      .getMany();
  }

  async getAllPostsByCategory(category: PostCategory) {
    try {
      return await this.postsRepository
        .createQueryBuilder('post')
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.nickname'])
        .where('post.category = :category', { category })
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
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.nickname'])
      .where('postView.viewedAt >= :dateFilter', { dateFilter })
      .groupBy('post.id')
      .orderBy('COUNT(post.views)', 'DESC')
      .getMany();
  }

  async getPostById(id: number): Promise<Posts> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.nickname'])
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException(`해당 글이 존재하지 않습니다.`);
    }
    return post;
  }

  // 글 상세 조회
  async getPostByIdForViewing(id: number): Promise<Posts> {
    const post = await this.getPostById(id);

    // 조회수 증가
    post.views += 1;
    await this.postsRepository.save(post);

    const postView = new PostViews();
    postView.post = post;
    await this.postViewsRepository.save(postView);

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
