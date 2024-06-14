import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostCategory } from 'src/entities/Posts';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { SearchPostDto } from './dto/search-post.dto';

@ApiTags('POSTS')
@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: '글 작성' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  async createPost(
    @CurrentUser() user,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return await this.postsService.createPost(user.id, createPostDto, image);
  }

  @ApiOperation({ summary: '전제 글 조회' })
  @Get()
  async getAllPosts() {
    return await this.postsService.getAllPosts();
  }

  @ApiOperation({ summary: '전제 글 기간 별 인기순 조회' })
  @Get('views/:period')
  async getAllPostsByViewsAndPeriod(@Param('period') period: string) {
    return await this.postsService.getAllPostsByViewsAndPeriod(period);
  }

  @ApiOperation({ summary: '카테고리 별 글 조회' })
  @Get('category/:category')
  async getAllPostsByCategory(@Param('category') category: PostCategory) {
    return await this.postsService.getAllPostsByCategory(category);
  }

  @ApiOperation({ summary: '글 검색' })
  @Get('search')
  async searchPosts(@Query() searchPostDto: SearchPostDto) {
    return await this.postsService.searchPosts(searchPostDto);
  }

  @ApiOperation({ summary: '글 상세 조회' })
  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostByIdForViewing(id);
  }

  @ApiOperation({ summary: '글 수정' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @CurrentUser() user,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, user.id, user.role, updatePostDto);
  }

  @ApiOperation({ summary: '글 삭제' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@CurrentUser() user, @Param('id', ParseIntPipe) id: number) {
    await this.postsService.deletePost(id, user.id, user.role);
    return {
      statusCode: 200,
      message: '글 삭제 성공',
    };
  }
}
