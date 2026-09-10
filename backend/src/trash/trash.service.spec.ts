import { Test, TestingModule } from '@nestjs/testing';
import { TrashService } from './trash.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('TrashService', () => {
  let service: TrashService;

  const mockPrisma = {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: 1, deletedAt: null }),
      delete: jest.fn().mockResolvedValue({ id: 1 }),
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrashService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TrashService>(TrashService);
  });

  it('should find deleted records', async () => {
    const result = await service.findAll('users');
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: { deletedAt: { not: null } },
    });
    expect(result).toEqual([]);
  });

  it('should restore a deleted record', async () => {
    const result = await service.restore('users', 1);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: null },
    });
    expect(result.deletedAt).toBeNull();
  });

  it('should force delete a record', async () => {
    const result = await service.forceDelete('users', 1);
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result.id).toBe(1);
  });

  it('should throw for unknown entity', async () => {
    await expect(service.findAll('unknown')).rejects.toThrow('Unknown entity: unknown');
  });
});
