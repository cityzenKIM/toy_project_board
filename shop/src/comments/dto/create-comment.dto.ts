import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Comments } from 'src/entities/Comments';

export class CreateCommentDto extends PickType(Comments, ['content'] as const) {
  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  postId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  parentId: number;
}
