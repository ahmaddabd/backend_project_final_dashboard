import { NotFoundException } from "@nestjs/common";

export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super({
      message: `User with ID ${userId} not found`,
      error: "Not Found",
      statusCode: 404,
    });
  }

  static withEmail(email: string): UserNotFoundException {
    return new UserNotFoundException(`User with email ${email} not found`);
  }
}
