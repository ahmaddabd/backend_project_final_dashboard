// src/interface/http/controllers/stores.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import { StoresService } from "@application/stores/services/stores.service";
import { CreateStoreDto } from "@application/stores/dto/create-store.dto";
import { UpdateStoreDto } from "@application/stores/dto/update-store.dto";
import { JwtAuthGuard } from "@application/auth/guards/jwt-auth.guard";
import { CurrentUser } from "@application/auth/decorators/current-user.decorator";
import { UserEntity } from "@domain/entities/user.entity";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { StoreOwnerGuard } from "@application/stores/guards/store-owner.guard";
import { Roles } from "@application/auth/decorators/roles.decorator";
import { UserRole } from "@application/auth/decorators/roles.decorator";
import { RolesGuard } from "@application/auth/guards/roles.guard";
import { StoreProgressEntity } from "@domain/entities/store-progress.entity";

@ApiTags("stores")
@Controller("stores")
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "Create a new store" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The store has been successfully created.",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "User already has a store.",
  })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized." })
  async createStore(
    @Body() createStoreDto: CreateStoreDto,
    @CurrentUser() user: UserEntity
  ) {
    return await this.storesService.createStore(createStoreDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get all stores" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Return all stores.",
    isArray: true,
  })
  async getStores() {
    return await this.storesService.getStores();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a store by ID" })
  @ApiParam({ name: "id", description: "The ID of the store" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The found store.",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Store not found." })
  async getStoreById(@Param("id", ParseUUIDPipe) id: string) {
    return await this.storesService.getStoreById(id);
  }

    @Get('by-slug/:slug')
    @ApiOperation({ summary: 'Get a store by slug' })
    @ApiParam({