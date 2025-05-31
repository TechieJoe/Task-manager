import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        // Mock any dependencies here if needed
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Example: Add a test for findByEmail (mock implementation)
  it('should return null for non-existing user', async () => {
    jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
    const user = await service.findByEmail('notfound@example.com');
    expect(user).toBeNull();
  });
});