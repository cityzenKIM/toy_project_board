import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Posts } from './Posts';

@Entity({ schema: 'shop', name: 'postViews' })
export class PostViews {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  viewedAt: Date;

  @ManyToOne(() => Posts, (post) => post.postViews, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'postId', referencedColumnName: 'id' }])
  post: Posts;
}
