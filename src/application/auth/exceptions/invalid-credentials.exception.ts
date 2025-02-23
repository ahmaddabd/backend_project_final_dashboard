import { UnauthorizedException } from "@nestjs/common";

export class InvalidCredentialsException extends UnauthorizedException {
  constructor(message: string = "Invalid credentials") {
    super({
      message,
      error: "Unauthorized",
      statusCode: 401,
    });
  }
}
