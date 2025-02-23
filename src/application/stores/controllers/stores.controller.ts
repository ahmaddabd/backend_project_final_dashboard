import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { StoresService } from '../services/stores.service';
import { JwtAuthGuard } from '@application/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@application/auth/decorators/current-user.decorator';
import { UserEntity } from '@domain/entities/user.entity';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Patch(':storeId/complete-step/:step')
  async completeStep(
    @Param('storeId') storeId: string,
    @Param('step') step: string,
    @CurrentUser() user: UserEntity,
  ) {
    if (user.store.id !== storeId) {
      throw new UnauthorizedException('You do not own this store');
    }

    return { progress: await this.storesService.completeStep(storeId, step) };
  }

  @Get(':storeId/progress')
  async getStoreProgress(@Param('storeId') storeId: string) {
    return this.storesService.getStoreProgress(storeId);
  }
}