import { Module } from '@nestjs/common';
import { ReviewsService } from './services/reviews.service';
import { ReviewsController } from '@interface/http/controllers/reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '@domain/entities/review.entity';
import { ReviewRepository } from '@infrastructure/repositories/review.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, ReviewRepository])],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewRepository],
  exports: [ReviewsService],
})
export class ReviewsModule {}