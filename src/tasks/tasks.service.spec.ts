import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TaskService } from './tasks.service';
import { NotFoundException } from '@nestjs/common';

const mockTaskModel = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  lean: jest.fn(),
});

const mockTask = {
  _id: 'taskId',
  title: 'Test',
  description: 'desc',
  priority: 'low',
  userId: 'user123',
};

describe('TaskService', () => {
  let service: TaskService;
  let taskModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken('Task'),
          useFactory: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskModel = module.get(getModelToken('Task'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a task', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockTask);
      taskModel.mockImplementationOnce(() => ({ ...mockTask, save: saveMock }));
      const result = await service.create('user123', mockTask as any);
      expect(result).toEqual(mockTask);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return all tasks for a user', async () => {
      const leanMock = jest.fn().mockResolvedValue([mockTask]);
      taskModel.find.mockReturnValue({ lean: leanMock });
      const result = await service.findAllByUser('user123');
      expect(result).toEqual([mockTask]);
      expect(taskModel.find).toHaveBeenCalledWith({ userId: 'user123' });
    });
  });

  describe('findOne', () => {
    it('should return a task by id and userId', async () => {
      taskModel.findOne.mockResolvedValue(mockTask);
      const result = await service.findOne('user123', 'taskId');
      expect(result).toEqual(mockTask);
      expect(taskModel.findOne).toHaveBeenCalledWith({ _id: 'taskId', userId: 'user123' });
    });

    it('should throw NotFoundException if task not found', async () => {
      taskModel.findOne.mockResolvedValue(null);
      await expect(service.findOne('user123', 'notfound')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the task', async () => {
      taskModel.findOneAndUpdate.mockResolvedValue(mockTask);
      const result = await service.update('user123', 'taskId', { title: 'Updated' } as any);
      expect(result).toEqual(mockTask);
      expect(taskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'taskId', userId: 'user123' },
        { title: 'Updated' },
        { new: true },
      );
    });

    it('should throw NotFoundException if task not found', async () => {
      taskModel.findOneAndUpdate.mockResolvedValue(null);
      await expect(service.update('user123', 'notfound', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the task', async () => {
      taskModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
      await expect(service.remove('user123', 'taskId')).resolves.toBeUndefined();
      expect(taskModel.deleteOne).toHaveBeenCalledWith({ _id: 'taskId', userId: 'user123' });
    });

    it('should throw NotFoundException if task not found', async () => {
      taskModel.deleteOne.mockResolvedValue({ deletedCount: 0 });
      await expect(service.remove('user123', 'notfound')).rejects.toThrow(NotFoundException);
    });
  });
});