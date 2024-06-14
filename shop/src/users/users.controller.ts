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
    return await this.usersService.signUp(body);
  }
}
