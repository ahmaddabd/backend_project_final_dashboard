import { Module } from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { CategoriesController } from '@interface/http/controllers/categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '@domain/entities/category.entity';
import { CategoryRepository } from '@infrastructure/repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, CategoryRepository])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepository],
  exports: [CategoriesService],
})
export class CategoriesModule {}