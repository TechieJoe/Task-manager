import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto, UpdateTaskDto } from 'src/utils/dto/task';
import { Task } from '../utils/schema/task';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    const task = new this.taskModel({ ...createTaskDto, userId }); // attach userId correctly
    return task.save();
  }

  async findAllByUser(userId: string): Promise<Task[]> {
    return this.taskModel.find({ userId }).lean(); // use correct field name
  }

  async findOne(userId: string, id: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, userId }); // use correct field name
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(userId: string, id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: id, userId }, // use correct field name
      updateTaskDto,
      { new: true },
    );
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: id, userId }); // use correct field name
    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found');
    }
  }
}
