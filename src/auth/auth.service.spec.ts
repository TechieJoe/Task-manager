import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../utils/schema/user';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let jwtService: any;

  beforeEach(async () => {
    const saveMock = jest.fn().mockResolvedValue(true);

    // ✅ Mock Mongoose Model Constructor
    userModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: saveMock,
      get: (field: string) => data[field],
      _id: 'user123',
    }));

    // ✅ Mock static methods on the model (e.g., findOne)
    userModel.findOne = jest.fn();

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      const dto = { email: 'a@b.com', password: '1234', name: 'Alice' };

      const result = await service.register(dto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user123', name: 'Alice' });
    });
  });

  describe('validateUser', () => {
    it('should return user when password matches', async () => {
      const fakeUser = { password: await bcrypt.hash('pass123', 10) };
      userModel.findOne.mockResolvedValue(fakeUser);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(true);

      const result = await service.validateUser('x@x.com', 'pass123');
      expect(result).toBe(fakeUser);
    });

    it('should return null when user not found', async () => {
      userModel.findOne.mockResolvedValue(null);

      const result = await service.validateUser('x@x.com', 'pass123');
      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      userModel.findOne.mockResolvedValue({ password: 'hashed' });
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(false);

      const result = await service.validateUser('x@x.com', 'wrong');
      expect(result).toBeNull();
    });
  });

describe('login', () => {
  it('should return JWT if credentials are valid', async () => {
    const user = {
      _id: 'user1',
      get: () => 'Bob',
    } as any; // 👈 TypeScript bypass here

    jest.spyOn(service, 'validateUser').mockResolvedValue(user);

    const result = await service.login({ email: 'e@e.com', password: 'pw' });
    expect(result.access_token).toBe('mock-jwt-token');
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    jest.spyOn(service, 'validateUser').mockResolvedValue(null);

    await expect(service.login({ email: 'e@e.com', password: 'pw' })).rejects.toThrow(UnauthorizedException);
  });
});
});
