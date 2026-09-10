import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../common/prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: PrismaService;

  const mockPrisma = {
    $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return ok status when database is connected', async () => {
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(result.uptime).toBeGreaterThan(0);
  });

  it('should return error status when database is disconnected', async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Connection failed'));
    const result = await controller.check();
    expect(result.status).toBe('error');
    expect(result.database).toBe('disconnected');
  });
});
