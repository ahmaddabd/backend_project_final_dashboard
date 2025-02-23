import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { StoreEntity } from "./store.entity";
import { ReviewEntity } from "./review.entity";

@Entity("products")
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column("int", { default: 0 })
  stock: number;

  @Column("simple-array", { nullable: true })
  categories?: string[];

  @Column("simple-array", { nullable: true })
  images?: string[];

  @Column("jsonb", { nullable: true })
  specifications?: Record<string, any>;

  @ManyToOne(() => StoreEntity, (store) => store.products, {
    onDelete: "CASCADE",
  })
  store: StoreEntity;

  @OneToMany(() => ReviewEntity, (review) => review.product)
  reviews: ReviewEntity[];

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, any>;

  constructor(partial: Partial<ProductEntity>) {
    super();
    Object.assign(this, partial);
  }

  toJSON() {
    const { metadata, ...rest } = this;
    return rest;
  }
}
