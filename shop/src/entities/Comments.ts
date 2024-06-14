import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './Users';
import { Posts } from './Posts';
import { IsNotEmpty, IsString } from 'class-validator';

@Index(['deletedAt'])
@Entity({ schema: 'shop', name: 'comment' })
export class Comments {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column('text', { name: 'content' })
  content: string;

  @IsString()
  @IsNotEmpty()
  @Column('varchar', { name: 'nickname', length: 30 })
  authorNickname: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  // 자식 댓글
  @OneToMany(() => Comments, (comments) => comments.parent)
  children: Comments[];

  // 부모 댓글
  @ManyToOne(() => Comments, (comments) => comments.children, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId', referencedColumnName: 'id' })
  parent: Comments;

  @ManyToOne(() => Users, (users) => users.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Users;

  @ManyToOne(() => Posts, (posts) => posts.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'postId', referencedColumnName: 'id' }])
  post: Posts;
}
