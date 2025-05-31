// user.controller.ts
import { Controller, Get, Render, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/utils/guard/jwt.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

// user.controller.ts
@Get('profile')
getProfile(@Req() req) {
  return this.userService.getProfile(req.user.id);
}


}
