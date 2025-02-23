import {
  Repository,
  FindOptionsWhere,
  UpdateResult,
  ObjectLiteral,
  DeepPartial,
} from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { IBaseEntity } from "../../domain/interfaces/base.entity.interface";

export abstract class BaseRepository<
  T extends ObjectLiteral & IBaseEntity
> extends Repository<T> {
  async findByIdOrFail(id: string): Promise<T> {
    const entity = await this.findOne({
      where: { id, isActive: true } as FindOptionsWhere<T>,
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }

    return entity;
  }

  async createAndSave(data: DeepPartial<T>): Promise<T> {
    const entity = super.create(data);
    return await super.save(entity);
  }

  async softDeleteById(id: string): Promise<UpdateResult> {
    return await super.update(
      { id } as FindOptionsWhere<T>,
      { isActive: false } as unknown as DeepPartial<T>
    );
  }

  async restoreById(id: string): Promise<UpdateResult> {
    return await super.update(
      { id } as FindOptionsWhere<T>,
      { isActive: true } as unknown as DeepPartial<T>
    );
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.count({
      where: { id, isActive: true } as FindOptionsWhere<T>,
    });
    return count > 0;
  }

  async findActive(options?: FindOptionsWhere<T>): Promise<T[]> {
    return this.find({
      where: {
        ...options,
        isActive: true,
      } as FindOptionsWhere<T>,
    });
  }

  async findOneActive(options?: FindOptionsWhere<T>): Promise<T | null> {
    return this.findOne({
      where: {
        ...options,
        isActive: true,
      } as FindOptionsWhere<T>,
    });
  }

  async updateById(id: string, data: DeepPartial<T>): Promise<T> {
    await super.update({ id } as FindOptionsWhere<T>, data);
    return this.findByIdOrFail(id);
  }

  async deleteById(id: string, soft = true): Promise<void> {
    if (soft) {
      await this.softDeleteById(id);
    } else {
      await super.delete(id);
    }
  }

  async findActiveById(id: string): Promise<T | null> {
    return this.findOneActive({ id } as FindOptionsWhere<T>);
  }

  async countActive(options?: FindOptionsWhere<T>): Promise<number> {
    return this.count({
      where: {
        ...options,
        isActive: true,
      } as FindOptionsWhere<T>,
    });
  }
}
