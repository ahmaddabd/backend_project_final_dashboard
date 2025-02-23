// src/application/products/services/products.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { ProductRepository } from "@infrastructure/repositories/product.repository";
import { CreateProductDto } from "@application/products/dto/create-product.dto";
import { UpdateProductDto } from "@application/products/dto/update-product.dto";
import { ProductEntity } from "@domain/entities/product.entity";
import { StoresService } from "@application/stores/services/stores.service";
import { slugify, generateUniqueSlug } from "@utils/slugify";
import { UserEntity } from "@domain/entities/user.entity";
import { In } from "typeorm";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly storesService: StoresService
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    storeId: string,
    user: UserEntity
  ): Promise<ProductEntity> {
    const store = await this.storesService.getStoreById(storeId);

    // Check store ownership
    if (store.owner.id !== user.id && !user.roles.includes('admin')) {
      throw new ForbiddenException(
        "You are not authorized to add products to this store."
      );
    }

    const baseSlug = slugify(createProductDto.name);
    const exists = async (slug: string) =>
      !!(await this.productRepository.findOne({ where: { slug } }));
    const uniqueSlug = await generateUniqueSlug(baseSlug, exists);

    const product = this.productRepository.create({
      ...createProductDto,
      slug: uniqueSlug,
      store,
    });

    return this.productRepository.save(product);
  }

  async getProducts(storeId?: string, category?: string[], minPrice?: number, maxPrice?: number, search?: string): Promise<ProductEntity[]> {
    const where: any = { isActive: true };

    if (storeId) {
      where.store = { id: storeId };
    }
    if (category && category.length > 0) {
        where.categories = In(category);
    }

    if (minPrice !== undefined) {
      where.price = where.price || {};
      where.price.min = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price = where.price || {};
      where.price.max = maxPrice;
    }

    if(search) {
        where.name =  { $regex: search, $options: 'i' };
    }

    return this.productRepository.find({ where, relations: ["store"] });
  }



  async getProductById(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findByIdOrFail(id);
     if (!product) {
        throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async getProductBySlug(slug: string): Promise<ProductEntity> {
      const product = await this.productRepository.findOneActive({ slug });
        if (!product) {
            throw new NotFoundException(`Product with slug "${slug}" not found`);
        }
        return product;
    }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    user: UserEntity
  ): Promise<ProductEntity> {
    const product = await this.productRepository.findByIdOrFail(id);
    const store = await product.store;


    if (store.owner.id !== user.id && !user.roles.includes('admin')) {
      throw new ForbiddenException(
        "You are not authorized to update this product."
      );
    }

      // Prevent slug updates (optional, but recommended)
    if (updateProductDto.slug && product.slug !== updateProductDto.slug) {
      throw new ForbiddenException("Cannot change the product slug.");
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async deleteProduct(id: string, user: UserEntity): Promise<void> {
    const product = await this.productRepository.findByIdOrFail(id);
    const store = await product.store;

    if (store.owner.id !== user.id && !user.roles.includes('admin')) {
      throw new ForbiddenException(
        "You are not authorized to delete this product."
      );
    }
    await this.productRepository.softDeleteById(id);
  }

    async findByStore(storeId: string): Promise<ProductEntity[]> {
    return this.productRepository.findActive({ store: { id: storeId } } as any);
  }

  async search(query: string): Promise<ProductEntity[]> {
      return this.productRepository.createQueryBuilder("product")
          .where("product.name ILIKE :query", { query: `%${query}%` })
          .orWhere("product.description ILIKE :query", { query: `%${query}%` })
          .getMany();
  }
}