import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
  Render,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateTaskDto, UpdateTaskDto } from '../utils/dto/task';
import { TaskService } from './tasks.service';
import { JwtAuthGuard } from '../utils/guard/jwt.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('/')
  async findAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const user = req.user as any;
    if (!user?.userId) throw new UnauthorizedException('User not authenticated');

    const tasks = await this.taskService.findAllByUser(user.userId);
    return res.render('tasks/index', { tasks });
  }

  @Post()
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<void> {
    const user = req.user as any;
    if (!user?.userId) throw new UnauthorizedException('User not authenticated');

    await this.taskService.create(user.userId, createTaskDto);
    return res.redirect('/tasks');
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<void> {
    const user = req.user as any;
    if (!user?.userId) throw new UnauthorizedException('User not authenticated');

    await this.taskService.update(user.userId, id, updateTaskDto);
    return res.redirect(`/tasks/${id}`);
  }


  @Delete(':id')
  async remove(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<void> {
    const user = req.user as any;
    if (!user?.userId) throw new UnauthorizedException('User not authenticated');

    await this.taskService.remove(user.userId, id);
    return res.redirect('/tasks');
  }  

  
}
