import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity("blacklisted_tokens")
export class BlacklistedTokenEntity extends BaseEntity {
  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  reason?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ default: false })
  isRefreshToken: boolean;

  constructor(partial: Partial<BlacklistedTokenEntity>) {
    super();
    Object.assign(this, partial);
  }

  static create(
    token: string,
    expiresAt: Date,
    options?: { reason?: string; userId?: string; isRefreshToken?: boolean }
  ): BlacklistedTokenEntity {
    return new BlacklistedTokenEntity({
      token,
      expiresAt,
      ...options,
    });
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
