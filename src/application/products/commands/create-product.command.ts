import { ICommand } from '@nestjs/cqrs';

export class CreateProductCommand implements ICommand {
  constructor(
    public readonly storeId: number,
    public readonly userId: number,
    public readonly name: string,
    public readonly price: number,
  ) {}
}