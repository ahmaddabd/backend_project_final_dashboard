import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { AuthRepository } from "../../../infrastructure/repositories/auth.repository";
import { UserEntity } from "../../../domain/entities/user.entity";
import { RegisterDto } from "../dto/register.dto";
import { InvalidCredentialsException } from "../exceptions/invalid-credentials.exception";
import { UserNotFoundException } from "../exceptions/user-not-found.exception";
import { UserRole } from "../decorators/roles.decorator";

describe("AuthService", () => {
  let service: AuthService;
  let authRepository: AuthRepository;
  let jwtService: JwtService;

  const mockUser = new UserEntity({
    id: "1",
    email: "test@example.com",
    password: "hashedPassword123",
    firstName: "John",
    lastName: "Doe",
    roles: [UserRole.USER],
  });

  const mockAuthRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createAndSave: jest.fn(),
    updateRefreshToken: jest.fn(),
    findByRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    const registerDto: RegisterDto = {
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    it("should successfully register a new user", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);
      mockAuthRepository.createAndSave.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(mockAuthRepository.createAndSave).toHaveBeenCalled();
    });

    it("should throw if user already exists", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe("validateUser", () => {
    it("should return user if credentials are valid", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser(
        "test@example.com",
        "password123"
      );

      expect(result).toEqual(mockUser);
    });

    it("should throw InvalidCredentialsException if user not found", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser("test@example.com", "password123")
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it("should throw InvalidCredentialsException if password is invalid", async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        service.validateUser("test@example.com", "wrongpassword")
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe("login", () => {
    it("should return tokens when login is successful", async () => {
      const mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      mockJwtService.signAsync.mockResolvedValue("token");
      mockAuthRepository.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(mockUser);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(mockAuthRepository.updateRefreshToken).toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    it("should throw if user not found", async () => {
      mockAuthRepository.findById.mockResolvedValue(null);

      await expect(
        service.refreshToken("user-id", "refresh-token")
      ).rejects.toThrow(UserNotFoundException);
    });

    it("should throw if refresh token is invalid", async () => {
      mockAuthRepository.findById.mockResolvedValue({
        ...mockUser,
        refreshToken: "different-token",
      });

      await expect(
        service.refreshToken("user-id", "refresh-token")
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe("logout", () => {
    it("should clear refresh token", async () => {
      await service.logout("user-id");

      expect(mockAuthRepository.updateRefreshToken).toHaveBeenCalledWith(
        "user-id",
        null
      );
    });
  });
});
