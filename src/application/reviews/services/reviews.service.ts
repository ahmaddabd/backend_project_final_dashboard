import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewRepository } from '@infrastructure/repositories/review.repository';
import { ReviewEntity } from '@domain/entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getAllReviews(): Promise<ReviewEntity[]> {
    return this.reviewRepository.findReviews();
  }

  async createReview(createReviewDto: CreateReviewDto): Promise<ReviewEntity> {
    const review = this.reviewRepository.create(createReviewDto);
    return this.reviewRepository.save(review);
  }
}
