import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { StoreEntity } from "./store.entity";

export enum StoreSetupStep {
  BASIC_INFO = "basic_info",
  LOCATION = "location",
  CATEGORIES = "categories",
  IMAGES = "images",
  SETTINGS = "settings",
  VERIFICATION = "verification",
}

@Entity("store_progress")
export class StoreProgressEntity extends BaseEntity {
  @ManyToOne(() => StoreEntity, { onDelete: "CASCADE" })
  store: StoreEntity;

  @Column({
    type: "enum",
    enum: StoreSetupStep,
  })
  step: StoreSetupStep;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column("jsonb", { nullable: true })
  data?: Record<string, any>;

  constructor(partial: Partial<StoreProgressEntity>) {
    super();
    Object.assign(this, partial);
  }

  toJSON() {
    const { data, ...rest } = this;
    return rest;
  }
}
