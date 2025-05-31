import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Task, TaskSchema } from 'src/utils/schema/task';
import { JwtStrategy } from 'src/utils/strategies/jwt';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    JwtModule.register({}), // optional, included for completeness
  ],
  controllers: [TaskController],
  providers: [TaskService, JwtStrategy],
})
export class TaskModule {}
