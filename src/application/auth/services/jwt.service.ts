import { Injectable } from "@nestjs/common";
import { JwtService as NestJwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserEntity } from "../../../domain/entities/user.entity";

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService
  ) {}

  async generateAccessToken(user: UserEntity): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: this.configService.get("JWT_EXPIRATION", "1h"),
    });
  }

  async generateRefreshToken(user: UserEntity): Promise<string> {
    const payload = {
      sub: user.id,
      type: "refresh",
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRATION", "7d"),
    });
  }

  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get("JWT_SECRET"),
    });
  }

  async verifyRefreshToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
    });
  }

  async decodeToken(token: string): Promise<any> {
    return this.jwtService.decode(token);
  }
}
