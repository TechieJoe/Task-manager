import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';
import { JwtAuthGuard } from 'src/utils/guard/jwt.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: Partial<Record<keyof TaskService, jest.Mock>>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(async () => {
    taskService = {
      findAllByUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: TaskService, useValue: taskService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<TaskController>(TaskController);

    mockReq = { user: { userId: 'user123' } };
    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should render tasks for authenticated user', async () => {
      const tasks = [{ id: '1', title: 'Test' }];
      taskService.findAllByUser!.mockResolvedValue(tasks);

      await controller.findAll(mockReq, mockRes);

      expect(taskService.findAllByUser).toHaveBeenCalledWith('user123');
      expect(mockRes.render).toHaveBeenCalledWith('tasks/index', { tasks });
    });

    it('should throw UnauthorizedException if user not authenticated', async () => {
      const mockReqNoUser = { ...mockReq, user: null } as any;
      await expect(
        controller.findAll(mockReqNoUser, mockRes)
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('create', () => {
    it('should create a task and redirect', async () => {
      const dto = { title: 'New Task', priority: 'low', userId: 'user123' };
      taskService.create!.mockResolvedValue(undefined);

      await controller.create(mockReq, mockRes, dto);

      expect(taskService.create).toHaveBeenCalledWith('user123', dto);
      expect(mockRes.redirect).toHaveBeenCalledWith('/tasks');
    });

    it('should throw UnauthorizedException if user not authenticated', async () => {
      const mockReqNoUser = { ...mockReq, user: null } as any;
      await expect(
          controller.create(mockReqNoUser, mockRes, { title: 'x', priority: 'low', userId: 'user123' })
        ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should update a task and redirect', async () => {
      const dto = { title: 'Updated Task' };
      taskService.update!.mockResolvedValue(undefined);

      await controller.update(mockReq, mockRes, 'task1', dto);

      expect(taskService.update).toHaveBeenCalledWith('user123', 'task1', dto);
      expect(mockRes.redirect).toHaveBeenCalledWith('/tasks/task1');
    });

    it('should throw UnauthorizedException if user not authenticated', async () => {
      const mockReqNoUser = { ...mockReq, user: null } as any;
      await expect(
        controller.update(mockReqNoUser, mockRes, 'task1', { title: 'x' })
      ).rejects.toThrow(UnauthorizedException);
      await expect(
          controller.update({ ...mockReq, user: null } as any, mockRes, 'task1', { title: 'x' })
        ).rejects.toThrow(UnauthorizedException);
    });
    it('should remove a task and redirect', async () => {
      taskService.remove!.mockResolvedValue(undefined);

      await controller.remove(mockReq, mockRes, 'task1');

      expect(taskService.remove).toHaveBeenCalledWith('user123', 'task1');
      expect(mockRes.redirect).toHaveBeenCalledWith('/tasks');
    });

    it('should throw UnauthorizedException if user not authenticated', async () => {
      const mockReqNoUser = { ...mockReq, user: null } as any;
      await expect(
        controller.remove(mockReqNoUser, mockRes, 'task1')
      ).rejects.toThrow(UnauthorizedException);
      await expect(
         controller.update({ ...mockReq, user: null } as any, mockRes, 'task1', { title: 'x' })
        ).rejects.toThrow(UnauthorizedException);
    });
  });
});
