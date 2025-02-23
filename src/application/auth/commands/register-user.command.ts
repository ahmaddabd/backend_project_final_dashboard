import { ICommand } from "@nestjs/cqrs";
import { RegisterDto } from "../dto/register.dto";
import { UserRole } from "../decorators/roles.decorator";

export class RegisterUserCommand implements ICommand {
  constructor(
    public readonly data: RegisterDto,
    public readonly roles: UserRole[] = [UserRole.USER]
  ) {}

  static create(data: RegisterDto, roles?: UserRole[]): RegisterUserCommand {
    return new RegisterUserCommand(data, roles || [UserRole.USER]);
  }

  withRoles(roles: UserRole[]): RegisterUserCommand {
    return new RegisterUserCommand(this.data, roles);
  }

  toJSON() {
    return {
      command: "RegisterUser",
      data: {
        ...this.data,
        roles: this.roles,
      },
    };
  }

  toString(): string {
    return `RegisterUserCommand: Register user ${
      this.data.email
    } with roles [${this.roles.join(", ")}]`;
  }
}

export class RegisterUserHandler {
  async execute(command: RegisterUserCommand): Promise<void> {
    // This would typically be implemented in the auth service
    // We're using it here as a type definition for CQRS pattern
  }
}
