import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from '@interface/http/controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '@domain/entities/product.entity';
import { ProductRepository } from '@infrastructure/repositories/product.repository';
import { CategoriesModule } from '@application/categories/categories.module';
import { ImageUploadService } from '@application/common/services/image-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductRepository]), CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, ImageUploadService],
  exports: [ProductsService],
})
export class ProductsModule {}