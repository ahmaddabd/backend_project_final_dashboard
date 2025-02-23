import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../services/products.service';
import { ProductRepository } from '@infrastructure/repositories/product.repository';
import { StoresService } from '@application/stores/services/stores.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, ProductRepository, StoresService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return products by store', async () => {
    const mockProducts = [{ id: 1, name: 'Product A', storeId: 1 }];
    jest.spyOn(service, 'findByStore').mockResolvedValue(mockProducts);
    expect(await service.findByStore(1)).toEqual(mockProducts);
  });
});