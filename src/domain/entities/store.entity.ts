import { Entity, Column, OneToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";
import { ProductEntity } from "./product.entity";

@Entity("stores")
export class StoreEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column("jsonb", { nullable: true })
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @Column("simple-array", { nullable: true })
  categories?: string[];

  @Column("jsonb", { nullable: true })
  settings?: Record<string, any>;

  @Column("simple-array", { nullable: true })
  images?: string[];

  @OneToOne(() => UserEntity, (user) => user.store)
  owner: UserEntity;

  @OneToMany(() => ProductEntity, (product) => product.store)
  products: ProductEntity[];

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, any>;

  constructor(partial: Partial<StoreEntity>) {
    super();
    Object.assign(this, partial);
  }
}
