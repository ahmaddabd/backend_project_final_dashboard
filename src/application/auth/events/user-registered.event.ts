import { UserEntity } from "../../../domain/entities/user.entity";

export class UserRegisteredEvent {
  constructor(
    public readonly user: UserEntity,
    public readonly timestamp: Date = new Date()
  ) {}

  toString(): string {
    return `UserRegisteredEvent: User ${
      this.user.email
    } registered at ${this.timestamp.toISOString()}`;
  }

  toJSON() {
    return {
      event: "UserRegistered",
      data: {
        userId: this.user.id,
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        roles: this.user.roles,
        timestamp: this.timestamp.toISOString(),
      },
    };
  }

  static fromJSON(json: any): UserRegisteredEvent {
    const user = new UserEntity({
      id: json.data.userId,
      email: json.data.email,
      firstName: json.data.firstName,
      lastName: json.data.lastName,
      roles: json.data.roles,
    });

    return new UserRegisteredEvent(user, new Date(json.data.timestamp));
  }
}
