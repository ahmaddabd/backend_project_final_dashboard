import { EntityRepository, Repository } from 'typeorm';
import { ReviewEntity } from '@domain/entities/review.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(ReviewEntity)
export class ReviewRepository extends Repository<ReviewEntity> {
  async findByProduct(productId: number): Promise<ReviewEntity[]> {
    return this.find({ where: { product: productId } });
  }
}