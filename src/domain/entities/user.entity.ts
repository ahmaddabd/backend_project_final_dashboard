import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { Exclude } from "class-transformer";
import { BaseEntity } from "./base.entity";
import { StoreEntity } from "./store.entity";

@Entity("users")
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column("simple-array", { default: [] })
  roles: string[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @OneToOne(() => StoreEntity, (store) => store.owner, { nullable: true })
  @JoinColumn()
  store?: StoreEntity;

  constructor(partial: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }

  toJSON() {
    const { password, refreshToken, ...rest } = this;
    return rest;
  }
}
