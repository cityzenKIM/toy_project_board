import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Posts } from './Posts';
import { Comments } from './Comments';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRoleType {
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN',
  ANONYMOUS = 'ROLE_ANONYMOUS',
}
@Entity({ schema: 'shop', name: 'users' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @ApiProperty({
    example: 'abc123@naver.com',
    required: true,
  })
  @IsEmail()
  @Column('varchar', { name: 'email', unique: true, length: 30 })
  email: string;

  @ApiProperty({
    example: '메시',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Column('varchar', { name: 'nickname', length: 30 })
  nickname: string;

  @ApiProperty({
    example: '12345',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Column('varchar', { name: 'password', length: 100, select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRoleType,
    default: UserRoleType.USER,
  })
  role: UserRoleType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Posts, (posts) => posts.user)
  Posts: Posts[];

  @OneToMany(() => Comments, (comment) => comment.user)
  comments: Comments[];
}
