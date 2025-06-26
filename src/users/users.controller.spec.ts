import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../utils/guard/jwt.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUserService = {
    getProfile: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: '123',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile by ID from request', async () => {
      const expectedProfile = { id: '123', name: 'John Doe', email: 'john@example.com' };
      mockUserService.getProfile.mockResolvedValue(expectedProfile);

      const result = await controller.getProfile(mockRequest);
      expect(result).toEqual(expectedProfile);
      expect(mockUserService.getProfile).toHaveBeenCalledWith('123');
    });
  });
});
