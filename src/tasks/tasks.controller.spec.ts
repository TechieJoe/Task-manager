import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';
import { UnauthorizedException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from '../utils/dto/task';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: any;

  beforeEach(async () => {
    taskService = {
      findAllByUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: taskService }],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  const mockRes = () => {
    const res: any = {};
    res.render = jest.fn();
    res.redirect = jest.fn();
    return res;
  };

  describe('findAll', () => {
    it('should render tasks for authenticated user', async () => {
      const res = mockRes();
      const req = { user: { userId: '123' } };

      const tasks = [{ title: 'Task 1' }];
      taskService.findAllByUser.mockResolvedValue(tasks);

      await controller.findAll(req as any, res);
      expect(taskService.findAllByUser).toHaveBeenCalledWith('123');
      expect(res.render).toHaveBeenCalledWith('tasks/index', { tasks });
    });

    it('should throw UnauthorizedException if no userId', async () => {
      const req = { user: null };
      const res = mockRes();
      await expect(controller.findAll(req as any, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('create', () => {
    it('should create a task and redirect', async () => {
      const res = mockRes();
      const req = { user: { userId: '456' } };
      const dto: CreateTaskDto = {
        title: 'New Task',
        description: 'nice',
        priority: 'medium',
        userId: '456',
      };

      await controller.create(req as any, res, dto);
      expect(taskService.create).toHaveBeenCalledWith('456', dto);
      expect(res.redirect).toHaveBeenCalledWith('/tasks');
    });
  });

  describe('update', () => {
    it('should update task and redirect to task page', async () => {
      const res = mockRes();
      const req = { user: { userId: '789' } };
      const dto: UpdateTaskDto = {
        title: 'Updated Task',
                description: 'nice',

        priority: 'low',
        userId: '789',
      };

      await controller.update(req as any, res, 'task123', dto);
      expect(taskService.update).toHaveBeenCalledWith('789', 'task123', dto);
      expect(res.redirect).toHaveBeenCalledWith('/tasks/task123');
    });
  });

  describe('remove', () => {
    it('should remove task and redirect to tasks', async () => {
      const res = mockRes();
      const req = { user: { userId: '321' } };

      await controller.remove(req as any, res, 'task789');
      expect(taskService.remove).toHaveBeenCalledWith('321', 'task789');
      expect(res.redirect).toHaveBeenCalledWith('/tasks');
    });
  });
});
