// src/application/stores/services/stores.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { StoreRepository } from "@infrastructure/repositories/store.repository";
import { CreateStoreDto } from "@application/stores/dto/create-store.dto";
import { UpdateStoreDto } from "@application/stores/dto/update-store.dto";
import { StoreEntity } from "@domain/entities/store.entity";
import {
  slugify,
  generateUniqueSlug,
} from "@utils/slugify";
import { UserEntity } from "@domain/entities/user.entity";
import { StoreProgressEntity, StoreSetupStep } from "@domain/entities/store-progress.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class StoresService {
  constructor(
    private readonly storeRepository: StoreRepository,
    @InjectRepository(StoreProgressEntity)
    private readonly storeProgressRepository: Repository<StoreProgressEntity>,
  ) {}

  async createStore(
    createStoreDto: CreateStoreDto,
    owner: UserEntity
  ): Promise<StoreEntity> {
    // Check if the user already owns a store
    if (owner.store) {
      throw new ConflictException("User already owns a store.");
    }

    const baseSlug = slugify(createStoreDto.name);
    const exists = async (slug: string) =>
      !!(await this.storeRepository.findOne({ where: { slug } }));
    const uniqueSlug = await generateUniqueSlug(baseSlug, exists);

    const store = this.storeRepository.create({
      ...createStoreDto,
      slug: uniqueSlug,
      owner,
    });

    const savedStore = await this.storeRepository.save(store);

    // Initialize store progress
    await this.initializeStoreProgress(savedStore);

    return savedStore;
  }

  async getStores(): Promise<StoreEntity[]> {
    return this.storeRepository.findActive();
  }

  async getStoreById(id: string): Promise<StoreEntity> {
    return this.storeRepository.findByIdOrFail(id);
  }

    async getStoreBySlug(slug: string): Promise<StoreEntity> {
    const store = await this.storeRepository.findOneActive({ slug });
      if (!store) {
        throw new NotFoundException(`Store with slug "${slug}" not found`);
      }
      return store;
  }


  async updateStore(
    id: string,
    updateStoreDto: UpdateStoreDto,
    user: UserEntity
  ): Promise<StoreEntity> {
    const store = await this.storeRepository.findByIdOrFail(id);

    // Check if the user is the owner of the store
    if (store.owner.id !== user.id) {
      throw new ForbiddenException("You are not authorized to update this store.");
    }

    // Prevent slug updates if it's already set (optional)
    if (updateStoreDto.slug && store.slug !== updateStoreDto.slug) {
      throw new ForbiddenException("Cannot change the store slug.");
    }


    Object.assign(store, updateStoreDto);
    return this.storeRepository.save(store);
  }

  async deleteStore(id: string, user: UserEntity): Promise<void> {
    const store = await this.storeRepository.findByIdOrFail(id);

    if (store.owner.id !== user.id && !user.roles.includes('admin')) {
       throw new ForbiddenException("You are not authorized to delete this store.");
    }

    await this.storeRepository.softDeleteById(id);
  }

  async updateStoreStatus(
    storeId: string,
    status: "approved" | "rejected"
  ): Promise<StoreEntity> {
    const store = await this.storeRepository.findByIdOrFail(storeId);
    store.isVerified = status === "approved"; // Or use a dedicated status field
    return this.storeRepository.save(store);
  }

    async initializeStoreProgress(store: StoreEntity): Promise<void> {
    const steps = Object.values(StoreSetupStep);
    for (const step of steps) {
      await this.storeProgressRepository.save(
        this.storeProgressRepository.create({
          store,
          step,
          completed: false,
        })
      );
    }
  }

  async completeStep(storeId: string, step: string): Promise<StoreProgressEntity> {
    const storeProgress = await this.storeProgressRepository.findOne({
      where: { store: { id: storeId }, step: step as StoreSetupStep },
    });

    if (!storeProgress) {
      throw new NotFoundException(`Step ${step} not found for store ${storeId}`);
    }

    if (storeProgress.completed) {
      // Optionally handle already completed steps
      return storeProgress;
    }

    storeProgress.completed = true;
    storeProgress.completedAt = new Date();
    return this.storeProgressRepository.save(storeProgress);
  }


    async getStoreProgress(storeId: string): Promise<StoreProgressEntity[]> {
    return this.storeProgressRepository.find({
      where: { store: { id: storeId } },
      order: { step: 'ASC' }, // Ensure consistent order
    });
  }

    async isStoreSetupComplete(storeId: string): Promise<boolean> {
    const progress = await this.getStoreProgress(storeId);
    return progress.every(step => step.completed);
  }
}