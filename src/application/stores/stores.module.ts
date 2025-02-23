import { Module } from '@nestjs/common';
import { StoresService } from './services/stores.service';
import { StoresController } from '@interface/http/controllers/stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from '@domain/entities/store.entity';
import { StoreRepository } from '@infrastructure/repositories/store.repository';
import { ImageUploadService } from '@application/common/services/image-upload.service';
import { StoreOwnerGuard } from './guards/store-owner.guard';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity, StoreRepository])],
  controllers: [StoresController],
  providers: [StoresService, StoreRepository, ImageUploadService, StoreOwnerGuard],
  exports: [StoresService],
})
export class StoresModule {}