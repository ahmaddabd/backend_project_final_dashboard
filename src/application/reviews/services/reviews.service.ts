// src/application/reviews/services/reviews.service.ts
import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { ReviewRepository } from "@infrastructure/repositories/review.repository";
import { CreateReviewDto } from "@application/reviews/dto/create-review.dto";
import { UpdateReviewDto } from "@application/reviews/dto/update-review.dto";
import { ReviewEntity } from "@domain/entities/review.entity";
import { ProductsService } from "@application/products/services/products.service";  // Import ProductsService
import { UserEntity } from "@domain/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewRepository)
    private readonly reviewRepository: ReviewRepository,
    private readonly productsService: ProductsService, // Inject ProductsService
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    productId: string,
    user: UserEntity
  ): Promise<ReviewEntity> {

    const product = await this.productsService.getProductById(productId); // Use getProductById
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      product,
      user,
    });
    return this.reviewRepository.save(review);
  }


  async getReviewsByProduct(productId: string): Promise<ReviewEntity[]> {
    const product = await this.productsService.getProductById(productId); // Check if product exists
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ["user"], // Load user information
    });
  }

  async getReviewById(id: string): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findOne({
        where: { id },
        relations: ["user", "product"], // Include user and product
      });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }


  async updateReview(
    id: string,
    updateReviewDto: UpdateReviewDto,
    user: UserEntity
  ): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findOne({ where: {id}, relations: ['user']});
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.user.id !== user.id && !user.roles.includes('admin')) {
      throw new ForbiddenException(
        "You are not authorized to update this review."
      );
    }

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async deleteReview(id: string, user: UserEntity): Promise<void> {
    const review = await this.reviewRepository.findOne({where: {id}, relations: ['user']});
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.user.id !== user.id && !user.roles.includes('admin')) {
      throw new ForbiddenException(
        "You are not authorized to delete this review."
      );
    }
    await this.reviewRepository.delete(id);
  }
}