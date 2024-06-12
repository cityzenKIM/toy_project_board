import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './Users';
import { Comments } from './Comments';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity({ schema: 'shop', name: 'post' })
export class Posts {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column('varchar', { name: 'title', length: 30 })
  title: string;

  @IsString()
  @IsNotEmpty()
  @Column('text', { name: 'content' })
  content: string;

  @IsString()
  @Column('varchar', { name: 'imgUrl', length: 30 })
  imgUrl: string;

  @IsString()
  @IsNotEmpty()
  @Column('varchar', { name: 'category', length: 10 })
  category: string;

  @Column('int', { name: 'viewCount', default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comments, (comments) => comments.postId)
  Comments: Comments[];

  @ManyToOne(() => Users, (users) => users.Posts, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'Author', referencedColumnName: 'id' }])
  Author: Users;
}
