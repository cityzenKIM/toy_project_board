import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinRequestDto } from './dto/join-user.dto';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from 'src/entities/Users';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private dataSource: DataSource,
  ) {}

  async findByEmail(email: string): Promise<Users | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findByFields(options: FindOneOptions<Users>): Promise<Users | null> {
    return await this.userRepository.findOne(options);
  }

  async signUp(data: JoinRequestDto) {
    const { email, nickname, password } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await queryRunner.manager
      .getRepository(Users)
      .findOne({ where: { email } });
    if (user) {
      throw new UnauthorizedException('이미 존재하는 아이디입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const returned = await queryRunner.manager.getRepository(Users).save({
        email,
        nickname,
        password: hashedPassword,
      });

      await queryRunner.commitTransaction();
      return { email: returned.email, nickname: returned.nickname };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
