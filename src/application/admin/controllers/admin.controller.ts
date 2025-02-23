import { Controller, Patch, Param, UseGuards } from '@nestjs/common';
import { StoresService } from '@application/stores/services/stores.service';
import { RolesGuard } from '@application/auth/guards/roles.guard';
import { Roles } from '@application/auth/decorators/roles.decorator';

@Controller('admin/stores')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private storesService: StoresService) {}

  @Patch(':storeId/approve')
  @Roles('admin')
  async approveStore(@Param('storeId') storeId: string) {
    return this.storesService.updateStoreStatus(storeId, 'approved');
  }

  @Patch(':storeId/reject')
  @Roles('admin')
  async rejectStore(@Param('storeId') storeId: string) {
    return this.storesService.updateStoreStatus(storeId, 'rejected');
  }
}