import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../utils/dto/auth';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  const mockResponse = () => {
    const res: any = {};
    res.render = jest.fn();
    res.redirect = jest.fn();
    res.status = jest.fn().mockReturnThis();
    res.cookie = jest.fn();
    res.clearCookie = jest.fn();
    return res;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should register user and redirect', async () => {
      const res = mockResponse();
      const dto: RegisterDto = {
        name: 'joe',
        email: 'test@example.com',
        password: 'password',
      };

      await controller.register(dto, res);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(res.redirect).toHaveBeenCalledWith('/tasks');
    });

    it('should handle registration error and render with messages', async () => {
      const res = mockResponse();
      const dto: RegisterDto = {
        name: "joe",
        email: 'test@example.com',
        password: 'password',
      };

      const error = {
        response: { message: ['Email already in use.'] },
      };

      authService.register.mockRejectedValue(error);

      await controller.register(dto, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith('auth/register', {
        errors: ['Email already in use.'],
      });
    });
  });

  describe('login', () => {
    it('should login user, set JWT cookie, and redirect', async () => {
      const res = mockResponse();
      const req = {} as any;
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      authService.login.mockResolvedValue({ access_token: 'jwt-token' });

      await controller.login(dto, res, req);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith('jwt', 'jwt-token', { httpOnly: true });
      expect(res.redirect).toHaveBeenCalledWith('/tasks');
    });

    it('should handle login error and render with messages', async () => {
      const res = mockResponse();
      const req = {} as any;
      const dto: LoginDto = {
        email: 'wrong@example.com',
        password: 'wrong',
      };

      const error = {
        response: { message: 'Invalid email or password' },
      };

      authService.login.mockRejectedValue(error);

      await controller.login(dto, res, req);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.render).toHaveBeenCalledWith('auth/login', {
        errors: ['Invalid email or password'],
      });
    });
  });

  describe('logout', () => {
    it('should clear jwt cookie and redirect to login', async () => {
      const res = mockResponse();
      await controller.logout(res);
      expect(res.clearCookie).toHaveBeenCalledWith('jwt');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    });
  });
});
