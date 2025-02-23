import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { StoresService } from '../services/stores.service';
import { CreateStoreDto } from '../dto/create-store.dto';
import { UpdateStoreDto } from '../dto/update-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post('create')
  async createStore(@Body() dto: CreateStoreDto) {
    return this.storesService.createStore(dto);
  }

  @Get()
  async getStores() {
    return this.storesService.getStores();
  }

  @Put(':id')
  async updateStore(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storesService.updateStore(id, dto);
  }

  @Delete(':id')
  async deleteStore(@Param('id') id: string) {
    return this.storesService.deleteStore(id);
  }
}