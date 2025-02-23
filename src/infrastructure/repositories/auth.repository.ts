import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserNotFoundException } from "../../application/auth/exceptions/user-not-found.exception";

@Injectable()
export class AuthRepository extends Repository<UserEntity> {
  constructor(dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({
      where: {
        email,
        isActive: true,
      },
    });
  }

  async findByEmailOrFail(email: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw UserNotFoundException.withEmail(email);
    }
    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.findOne({
      where: {
        id,
        isActive: true,
      },
    });
  }

  async findByIdOrFail(id: string): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async findByRefreshToken(refreshToken: string): Promise<UserEntity | null> {
    return this.findOne({
      where: {
        refreshToken: refreshToken ?? undefined,
        isActive: true,
      },
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null
  ): Promise<void> {
    await this.update(userId, {
      refreshToken: refreshToken ?? undefined,
      lastLoginAt: refreshToken ? new Date() : undefined,
    });
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.update(userId, {
      isVerified: true,
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.update(userId, {
      password: hashedPassword,
    });
  }

  async findByIds(ids: string[]): Promise<UserEntity[]> {
    return this.find({
      where: {
        id: ids as any, // TypeORM will handle the IN query
        isActive: true,
      },
    });
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    return this.createQueryBuilder("user")
      .where("user.isActive = :isActive", { isActive: true })
      .andWhere(":role = ANY(user.roles)", { role })
      .getMany();
  }

  async searchUsers(query: string): Promise<UserEntity[]> {
    return this.createQueryBuilder("user")
      .where("user.isActive = :isActive", { isActive: true })
      .andWhere(
        "(LOWER(user.email) LIKE LOWER(:query) OR LOWER(user.firstName) LIKE LOWER(:query) OR LOWER(user.lastName) LIKE LOWER(:query))",
        { query: `%${query}%` }
      )
      .getMany();
  }

  async createAndSave(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.create(data);
    return await this.save(user);
  }
}
