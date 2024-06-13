import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { LoginRequestDto } from './dto/login-request.dto';

@ApiTags('AUTH')
@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger('AuthControllerLogger');
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @Post('login')
  async login(@Body() data: LoginRequestDto, @Res() res: Response) {
    const user = await this.authService.validateUser(data.email, data.password);
    const { accessToken, refreshToken } = await this.authService.generateTokens(
      user,
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return res.status(HttpStatus.OK).json({
      statusCode: 200,
      message: '로그인 성공',
      accessToken,
    });
  }

  @ApiOperation({ summary: '로그아웃' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
    });
    return res.status(HttpStatus.OK).json({
      statusCode: 200,
      message: '로그아웃 성공',
    });
  }

  @ApiOperation({ summary: '토큰 재발급' })
  @Post('refresh')
  async refreshToken(@Req() req, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    this.logger.log(refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('토큰이 존재하지 않습니다.');
    }
    const newTokens = await this.authService.refreshToken(refreshToken);
    res.cookie('refresh_token', newTokens.refreshToken, {
      httpOnly: true,
      secure: true, // HTTPS 사용 시에만 true
    });
    return res.status(HttpStatus.OK).json({
      statusCode: 200,
      accesToken: newTokens.accessToken,
    });
  }
}
