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
import { Comments } from './Comments';
import { IsNotEmpty, IsString } from 'class-validator';
import { PostViews } from './PostViews';
import { ApiProperty } from '@nestjs/swagger';

export enum PostCategory {
  NOTICE = 'NOTICE',
  QA = 'QA',
  ONE_ON_ONE = 'ONE_ON_ONE',
}

@Index(['deletedAt'])
@Entity({ schema: 'shop', name: 'post' })
export class Posts {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @ApiProperty({
    example: '글 제목입니다.',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Column('varchar', { name: 'title', length: 30 })
  title: string;

  @ApiProperty({
    example: '글 내용입니다.',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Column('text', { name: 'content' })
  content: string;

  @IsString()
  @Column('varchar', { name: 'imgUrl', nullable: true })
  imgUrl: string;

  @ApiProperty({
    example: ' NOTICE or QA or ONE_ON_ONE',
    required: true,
  })
  @Column({
    type: 'enum',
    enum: PostCategory,
    default: PostCategory.NOTICE,
  })
  category: PostCategory;

  @Column('int', { name: 'views', default: 1 })
  views: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => Comments, (comments) => comments.post)
  comments: Comments[];

  @OneToMany(() => PostViews, (postViews) => postViews.post)
  postViews: PostViews[];

  @ManyToOne(() => Users, (users) => users.Posts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Users;
}
