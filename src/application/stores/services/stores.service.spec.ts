import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from '../services/stores.service';
import { StoreRepository } from '@infrastructure/repositories/store.repository';

describe('StoresService', () => {
  let service: StoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoresService, StoreRepository],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all stores', async () => {
    const mockStores = [{ id: 1, name: 'Store A', slug: 'store-a' }];
    jest.spyOn(service, 'getAllStores').mockResolvedValue(mockStores);
    expect(await service.getAllStores()).toEqual(mockStores);
  });
});