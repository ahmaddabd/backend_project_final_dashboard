import { IQuery } from "@nestjs/cqrs";
import { UserEntity } from "../../../domain/entities/user.entity";

export class GetUserQuery implements IQuery {
  constructor(
    public readonly identifier: string,
    public readonly type: "id" | "email" = "id"
  ) {}

  static byId(id: string): GetUserQuery {
    return new GetUserQuery(id, "id");
  }

  static byEmail(email: string): GetUserQuery {
    return new GetUserQuery(email, "email");
  }

  toString(): string {
    return `GetUserQuery: Get user by ${this.type} ${this.identifier}`;
  }

  toJSON() {
    return {
      query: "GetUser",
      data: {
        identifier: this.identifier,
        type: this.type,
      },
    };
  }
}

export interface GetUserResult {
  user: UserEntity | null;
  found: boolean;
  error?: string;
}

export class GetUserHandler {
  async execute(query: GetUserQuery): Promise<GetUserResult> {
    // This would typically be implemented in the auth service
    // We're using it here as a type definition for CQRS pattern
    return {
      user: null,
      found: false,
      error: "Not implemented",
    };
  }
}
