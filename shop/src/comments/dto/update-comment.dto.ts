import { PickType } from '@nestjs/swagger';
import { Comments } from 'src/entities/Comments';

export class UpdateCommentDto extends PickType(Comments, [
  'content',
] as const) {}
