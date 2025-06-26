import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Task } from '../utils/schema/task';
import { CreateTaskDto, UpdateTaskDto } from '../utils/dto/task';

describe('TaskService', () => {
  let service: TaskService;
  let taskModelMock: any;

  beforeEach(async () => {
    // Mock constructor behavior for `new this.taskModel(...)`
    const mockTaskInstance = {
      save: jest.fn().mockResolvedValue({
        _id: 'mock-task-id',
        title: 'Sample Task',
        priority: 'high',
        userId: 'user-id',
      }),
    };

    taskModelMock = jest.fn().mockImplementation(() => mockTaskInstance); // constructor mock

    // Attach static methods for other service methods
    taskModelMock.find = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ _id: '1', title: 'Task 1', userId: 'user-id' }]),
    });

    taskModelMock.findOneAndUpdate = jest.fn().mockResolvedValue({
      _id: 'task-id',
      title: 'Updated Task',
      priority: 'medium',
      userId: 'user-id',
    });

    taskModelMock.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken(Task.name),
          useValue: taskModelMock,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should create a task', async () => {
    const dto: CreateTaskDto = {
      title: 'Sample Task',
      priority: 'high',
      userId: 'user-id',
    };

    const result = await service.create('user-id', dto);
    expect(result).toEqual({
      _id: 'mock-task-id',
      title: 'Sample Task',
      priority: 'high',
      userId: 'user-id',
    });
    expect(taskModelMock).toHaveBeenCalledWith({ ...dto, userId: 'user-id' });
  });

  it('should return tasks by user', async () => {
    const result = await service.findAllByUser('user-id');
    expect(result).toEqual([{ _id: '1', title: 'Task 1', userId: 'user-id' }]);
    expect(taskModelMock.find).toHaveBeenCalledWith({ userId: 'user-id' });
  });

  it('should update a task', async () => {
    const dto: UpdateTaskDto = {
      title: 'Updated Task',
      priority: 'medium',
      userId: 'user-id',
    };

    const result = await service.update('user-id', 'task-id', dto);
    expect(result).toEqual({ _id: 'task-id', ...dto });
    expect(taskModelMock.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'task-id', userId: 'user-id' },
      dto,
      { new: true },
    );
  });

  it('should remove a task', async () => {
    const result = await service.remove('user-id', 'task-id');
    expect(taskModelMock.deleteOne).toHaveBeenCalledWith({ _id: 'task-id', userId: 'user-id' });
    expect(result).toBeUndefined();
  });

});
