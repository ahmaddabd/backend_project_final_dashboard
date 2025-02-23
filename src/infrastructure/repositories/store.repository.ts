import { EntityRepository } from 'typeorm';
import { StoreEntity } from '@domain/entities/store.entity';
import { BaseRepository } from './base.repository';

@EntityRepository(StoreEntity)
export class StoreRepository extends BaseRepository<StoreEntity> {}