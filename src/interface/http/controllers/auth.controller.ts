// src/interface/http/controllers/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "@application/auth/services/auth.service";
import { LocalAuthGuard } from "@application/auth/guards/local-auth.guard";
import { JwtAuthGuard } from "@application/auth/guards/jwt-auth.guard";
import { RegisterDto } from "@application/auth/dto/register.dto";
import { LoginDto } from "@application/auth/dto/login.dto";
import { RefreshTokenDto } from "@application/auth/dto/refresh-token.dto";
import { Public } from "@application/auth/decorators/public.decorator";
import { CurrentUser } from "@application/auth/decorators/current-user.decorator";
import { UserEntity } from "@domain/entities/user.entity";
import { Request } from 'express';

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User successfully registered",
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "User already exists" })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User successfully logged in",
      schema: {
          type: 'object',
          properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              user: { type: 'object' } //  add user details
          }
      }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid credentials",
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
      return await this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Token successfully refreshed",
      schema: {
          type: 'object',
          properties: {
              accessToken: {type: 'string'}
          }
      }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid refresh token",
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User successfully logged out",
  })
  async logout(@Req() req: Request) {
      const authHeader = req.headers.authorization;
    if (!authHeader) {
      return { message: "Already logged out" }; // Or throw an exception if you prefer
    }
    const accessToken = authHeader.split(" ")[1]; // Assuming "Bearer <token>"
    await this.authService.logout(accessToken);
    return { message: "Successfully logged out" };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User profile retrieved successfully",
  })
  getProfile(@CurrentUser() user: UserEntity) {
    return user;
  }
}