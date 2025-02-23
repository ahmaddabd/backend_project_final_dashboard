import { IEvent } from '@nestjs/cqrs';

export class OrderPlacedEvent implements IEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
  ) {}
}