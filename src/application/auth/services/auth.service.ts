// src/application/auth/services/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthRepository } from "@infrastructure/repositories/auth.repository";
import { UserEntity } from "@domain/entities/user.entity";
import { RegisterDto } from "@application/auth/dto/register.dto";
import { LoginDto } from "@application/auth/dto/login.dto";
import { InvalidCredentialsException } from "@application/auth/exceptions/invalid-credentials.exception";
import { ConfigService } from "@nestjs/config";
import { UserNotFoundException } from "@application/auth/exceptions/user-not-found.exception";
import { BlacklistedTokenEntity } from "@domain/entities/blacklisted-token.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(BlacklistedTokenEntity)
    private readonly blacklistedTokenRepository: Repository<BlacklistedTokenEntity>
  ) {}

  async validateUser(
    email: string,
    password: string
  ): Promise<UserEntity | null> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  async register(registerDto: RegisterDto): Promise<UserEntity> {
    const existingUser = await this.authRepository.findByEmail(
      registerDto.email
    );
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.authRepository.createAndSave({
      ...registerDto,
      password: hashedPassword,
      roles: registerDto.roles || ["user"],
    });
    return user;
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Omit<UserEntity, "password" | "refreshToken">;
  }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      parseInt(this.configService.get<string>("BCRYPT_SALT_ROUNDS", "10"))
    );
    await this.authRepository.updateRefreshToken(user.id, hashedRefreshToken);

    const { password, refreshToken: storedRefreshToken, ...userData } = user;

    return {
      accessToken,
      refreshToken,
      user: userData,
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    // Check if refresh token is blacklisted
    const blacklistedToken = await this.blacklistedTokenRepository.findOne({
      where: { token: refreshToken, isRefreshToken: true },
    });
    if (blacklistedToken && !blacklistedToken.isExpired()) {
      throw new UnauthorizedException("Refresh token is invalid");
    }

    let decodedToken;
    try {
      decodedToken = await this.jwtService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.authRepository.findById(decodedToken.sub);

    if (!user) {
      throw new UserNotFoundException(decodedToken.sub);
    }

    // Verify that the provided refresh token matches the stored hashed refresh token
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Generate a new access token
    const accessToken = await this.generateAccessToken(user);

    // Optionally rotate refresh token (generate a new one)
    const newRefreshToken = await this.generateRefreshToken(user);
    const newHashedRefreshToken = await bcrypt.hash(
      newRefreshToken,
      parseInt(this.configService.get<string>("BCRYPT_SALT_ROUNDS", "10"))
    );
    await this.authRepository.updateRefreshToken(user.id, newHashedRefreshToken);

    // Blacklist the old refresh token
    await this.blacklistToken(refreshToken, decodedToken.exp, true, user.id);

    return { accessToken };
  }

  async logout(accessToken: string): Promise<void> {
    try {
      const decodedToken = await this.jwtService.verifyToken(accessToken);
      const expirationTime = new Date(decodedToken.exp * 1000); // Convert to Date object

      // Blacklist the access token
      await this.blacklistToken(accessToken, expirationTime, false);

      // Clear refresh token from database
      await this.authRepository.updateRefreshToken(decodedToken.sub, null);
    } catch (error) {
      // Token might be invalid, but we still proceed with logout
      console.warn("Error decoding token during logout:", error.message);
    }
  }

  private async generateAccessToken(user: UserEntity): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      type: "access", // Add token type
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: this.configService.get("JWT_EXPIRATION", "1h"),
      issuer: this.configService.get("JWT_ISSUER"),
      audience: this.configService.get("JWT_AUDIENCE"),
    });
  }

  private async generateRefreshToken(user: UserEntity): Promise<string> {
    const payload = {
      sub: user.id,
      type: "refresh", // Add token type
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRATION", "7d"),
      issuer: this.configService.get("JWT_ISSUER"),
      audience: this.configService.get("JWT_AUDIENCE"),
    });
  }

  private async blacklistToken(
    token: string,
    expiresAt: Date | number,
    isRefreshToken: boolean,
    userId?: string
  ): Promise<void> {
    const expirationDate =
      typeof expiresAt === "number" ? new Date(expiresAt * 1000) : expiresAt;

    const blacklistedToken = BlacklistedTokenEntity.create(token, expirationDate, {
      isRefreshToken,
      userId,
    });
    await this.blacklistedTokenRepository.save(blacklistedToken);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.blacklistedTokenRepository.findOne({
      where: { token },
    });
    return !!blacklistedToken && !blacklistedToken.isExpired();
  }
}