import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JoinRequestDto } from './dto/join-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('USERS')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '회원가입' })
  @Post()
  async signUp(@Body() body: JoinRequestDto) {
    const result = this.usersService.signUp(body);
    if (result) {
      return {
        statusCode: 200,
        message: '회원가입 성공',
        user: result,
      };
    }
  }
}
