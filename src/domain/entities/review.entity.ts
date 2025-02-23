import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";
import { ProductEntity } from "./product.entity";

@Entity("reviews")
export class ReviewEntity extends BaseEntity {
  @Column("int")
  rating: number;

  @Column("text")
  comment: string;

  @Column("simple-array", { nullable: true })
  images?: string[];

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  user: UserEntity;

  @ManyToOne(() => ProductEntity, (product) => product.reviews, {
    onDelete: "CASCADE",
  })
  product: ProductEntity;

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, any>;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedAt?: Date;

  @Column({ nullable: true })
  verifiedBy?: string;

  constructor(partial: Partial<ReviewEntity>) {
    super();
    Object.assign(this, partial);
  }

  toJSON() {
    const { metadata, ...rest } = this;
    return rest;
  }
}
