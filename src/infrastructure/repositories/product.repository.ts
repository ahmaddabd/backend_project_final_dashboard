import { EntityRepository } from 'typeorm';
import { ProductEntity } from '@domain/entities/product.entity';
import { BaseRepository } from './base.repository';

@EntityRepository(ProductEntity)
export class ProductRepository extends BaseRepository<ProductEntity> {}