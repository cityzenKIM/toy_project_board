import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './Users';
import { Posts } from './Posts';

@Entity({ schema: 'shop', name: 'comment' })
export class Comments {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('text', { name: 'content' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //   @Column('varchar', { name: 'authorNickname', length: 30 })
  //   authorNickName: string;

  @ManyToOne(() => Users, (users) => users.Comments, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'AuthorId', referencedColumnName: 'id' }])
  Author: Users;

  @ManyToOne(() => Posts, (posts) => posts.Comments, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'postId', referencedColumnName: 'id' }])
  postId: Posts;
}
