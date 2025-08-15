import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { type AuthenticatedRequest as LoginRequest } from './types/auth-jwtPayload';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { type Response } from 'express';
import { Public } from './decorators/public.decorator';
import { RefreshAuthGuard } from './guards/refresh-auth.guard/refresh-auth.guard';
import { Roles } from './decorators/roles.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  login(@Request() req: LoginRequest) {
    return this.authService.login(req.user.id, req.user.name, req.user.role);
  }

  @Roles('ADMIN', 'EDITOR')
  @Get('protected')
  getAll(@Request() req: LoginRequest) {
    return {
      messege: `Now you can access this protected API. this is your user ID: ${req.user.id}`,
    };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Request() req: LoginRequest) {
    return this.authService.refreshToken(req.user.id, req.user.name);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req: LoginRequest, @Res() res: Response) {
    // console.log('Google User', req.user);
    const resopnse = await this.authService.login(
      req.user.id,
      req.user.name,
      req.user.role,
    );
    res.redirect(
      `http://localhost:3000/api/auth/google/callback?userId=${resopnse.id}&name=${resopnse.name}&accessToken=${resopnse.accessToken}&refreshToken=${resopnse.refreshToken}&role=${resopnse.role}`,
    );
  }

  @Post('signout')
  signOut(@Req() req: LoginRequest) {
    return this.authService.signOut(req.user.id);
  }
}
