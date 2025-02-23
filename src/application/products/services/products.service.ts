import { Injectable, ForbiddenException } from '@nestjs/common';
import { ProductRepository } from '@infrastructure/repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ImageUploadService } from '@application/common/services/image-upload.service';
import { StoresService } from '@application/stores/services/stores.service';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository,
    private imageUploadService: ImageUploadService,
    private storesService: StoresService,
  ) {}

  async createProduct(storeId: number, userId: number, createProductDto: CreateProductDto) {
    const store = await this.storesService.getStoreById(storeId);

    if (store.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this store');
    }

    const product = this.productRepository.create({ ...createProductDto, store });
    return this.productRepository.save(product);
  }

  async getProducts() {
    return this.productRepository.find({ relations: ['store'] });
  }

  async findByStore(storeId: number) {
    return this.productRepository.find({ where: { store: storeId } });
  }

  async search(query: string) {
    return this.productRepository.find({ where: { name: query } });
  }
}