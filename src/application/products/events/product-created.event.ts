import { IEvent } from '@nestjs/cqrs';

export class ProductCreatedEvent implements IEvent {
  constructor(
    public readonly productId: number,
    public readonly storeId: number,
  ) {}
}