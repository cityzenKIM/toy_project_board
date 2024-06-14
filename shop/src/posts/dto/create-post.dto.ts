import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Posts } from 'src/entities/Posts';

export class CreatePostDto extends PickType(Posts, [
  'title',
  'content',
  'category',
] as const) {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image: Express.Multer.File;
}
