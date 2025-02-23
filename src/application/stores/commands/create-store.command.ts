import { ICommand } from '@nestjs/cqrs';

export class CreateStoreCommand implements ICommand {
  constructor(
    public readonly ownerId: number,
    public readonly name: string,
  ) {}
}