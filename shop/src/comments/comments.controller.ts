import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@ApiTags('COMMENTS')
@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: '댓글 작성' })
  @UseGuards(JwtAuthGuard)
  @Post()
  createComment(
    @CurrentUser() user,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(user.id, createCommentDto);
  }

  @ApiOperation({ summary: '특정 글 댓글 목록 조회' })
  @Get(':postId')
  async getCommentsByPostId(@Param('postId', ParseIntPipe) id: number) {
    return await this.commentsService.getCommentsByPostId(id);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateComment(
    @CurrentUser() user,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commentsService.updateComment(
      id,
      user.id,
      user.role,
      updateCommentDto,
    );
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteComment(
    @CurrentUser() user,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.commentsService.deleteComment(id, user.id, user.role);
    return {
      statusCode: 200,
      message: '댓글 삭제 성공',
    };
  }
}
