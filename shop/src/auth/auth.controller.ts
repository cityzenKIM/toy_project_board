import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@ApiTags('AUTH')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.generateTokens(
      req.user,
    );
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: true });
    return {
      statusCode: 200,
      message: '로그인 성공',
      accessToken,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
    });
    return {
      statusCode: 200,
      message: '로그아웃',
    };
  }

  @ApiOperation({ summary: '토큰 재발급' })
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Req() req, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('토큰이 존재하지 않습니다.');
    }
    try {
      const newTokens = await this.authService.refreshToken(refreshToken);
      res.cookie('refresh_token', newTokens.refreshToken, {
        httpOnly: true,
        secure: true, // HTTPS 사용 시에만 true
      });
      return {
        statusCode: 200,
        message: '로그인 성공',
        accessToken: newTokens.accessToken,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('토큰 생성 실패');
    }
  }
}
