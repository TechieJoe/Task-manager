import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { LoginDto, RegisterDto } from '../utils/dto/auth';
import { JwtAuthGuard } from '../utils/guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('register')
  getRegister(@Query('error') error: string, @Res() res: Response) {
    const messages = error ? decodeURIComponent(error).split('; ') : [];
    return res.render('auth/register', { errors: messages });
  }

  @Post('register')
  async register(
    @Body() createUserDto: RegisterDto,
    @Res() res: Response,
  ) {
    try {
      await this.authService.register(createUserDto);
      return res.redirect('/tasks');
    } catch (error) {
      let messages: string[] = ['Something went wrong.'];
      if (Array.isArray(error?.response?.message)) {
        messages = error.response.message;
      } else if (typeof error?.response?.message === 'string') {
        messages = [error.response.message];
      }
      return res.status(400).render('auth/register', { errors: messages });
    }
  }

// ...existing code...

@Get('login')
getLogin(@Query('error') error: string, @Res() res: Response) {
  const messages = error ? decodeURIComponent(error).split('; ') : [];
  res.render('auth/login', { errors: messages });
}

@Post('login')
async login(@Body() dto: LoginDto, @Res() res: Response, @Req() req: Request) {
  try {
    const { access_token } = await this.authService.login(dto);
    res.cookie('jwt', access_token, { httpOnly: true });
    console.log('Login successful, JWT set in cookie');
    return res.redirect('/tasks');
  } catch (error) {
    let messages: string[] = ['Invalid credentials.'];
    if (Array.isArray(error?.response?.message)) {
      messages = error.response.message;
    } else if (typeof error?.response?.message === 'string') {
      messages = [error.response.message];
    }
    // Render login with all errors
    return res.status(401).render('auth/login', { errors: messages });
  }
}

// ...existing code...
  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.redirect('/auth/login');
  }
}