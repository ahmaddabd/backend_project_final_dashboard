import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthRepository } from "../../../infrastructure/repositories/auth.repository";
import { UserEntity } from "../../../domain/entities/user.entity";
import { RegisterDto } from "../dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(
    email: string,
    password: string
  ): Promise<UserEntity | null> {
    const user = await this.authRepository.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async register(registerDto: RegisterDto): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.authRepository.createAndSave({
      ...registerDto,
      password: hashedPassword,
      roles: registerDto.roles || ["user"],
    });
    return user;
  }

  async login(user: UserEntity) {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.generateRefreshToken(),
    ]);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.authRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.authRepository.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await this.authRepository.updateRefreshToken(userId, null);
  }

  private async generateRefreshToken(): Promise<string> {
    const token = await bcrypt.hash(Math.random().toString(), 10);
    return token;
  }
}
