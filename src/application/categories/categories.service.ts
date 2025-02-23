// src/application/categories/services/categories.service.ts
import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { CategoryRepository } from "@infrastructure/repositories/category.repository";
import { CreateCategoryDto } from "@application/categories/dto/create-category.dto";
import { UpdateCategoryDto } from "@application/categories/dto/update-category.dto";
import { CategoryEntity } from "@domain/entities/category.entity";
import { slugify, generateUniqueSlug } from "@utils/slugify";
import { UserEntity } from "@domain/entities/user.entity";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
      user: UserEntity
  ): Promise<CategoryEntity> {

      if (!user.roles.includes('admin')) {
          throw new ForbiddenException("Only admins can create categories.");
      }

    const baseSlug = slugify(createCategoryDto.name);
    const exists = async (slug: string) =>
      !!(await this.categoryRepository.findOne({ where: { slug } }));
    const uniqueSlug = await generateUniqueSlug(baseSlug, exists);

    // Handle parent category
    let parentCategory: CategoryEntity | null = null;
    if (createCategoryDto.parentId) {
      parentCategory = await this.categoryRepository.findOne({where: {id: createCategoryDto.parentId}});
      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parentId} not found`
        );
      }
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug: uniqueSlug,
      parent: parentCategory,
    });
    return this.categoryRepository.save(category);
  }

  async getCategories(includeChildren: boolean = false, includeProducts: boolean = false): Promise<CategoryEntity[]> {
      const relations = [];
      if (includeChildren) {
          relations.push("children");
      }
      if(includeProducts){
          relations.push("products");
      }
    return this.categoryRepository.find({ relations });
  }

  async getCategoryById(id: string, includeChildren: boolean = false, includeProducts: boolean = false): Promise<CategoryEntity> {
      const relations = [];
      if (includeChildren) {
          relations.push("children");
      }
        if(includeProducts){
          relations.push("products");
      }
    const category = await this.categoryRepository.findOne({ where: { id }, relations });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

    async getCategoryBySlug(slug: string, includeChildren: boolean = false, includeProducts: boolean = false): Promise<CategoryEntity> {
        const relations = [];
        if (includeChildren) {
          relations.push("children");
        }
        if(includeProducts){
          relations.push("products");
      }
    const category = await this.categoryRepository.findOne({ where: { slug }, relations });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
      user: UserEntity
  ): Promise<CategoryEntity> {

      if (!user.roles.includes('admin')) {
          throw new ForbiddenException("Only admins can update categories.");
      }
    const category = await this.categoryRepository.findByIdOrFail(id);

      // Prevent slug updates (optional)
    if (updateCategoryDto.slug && category.slug !== updateCategoryDto.slug) {
      throw new ForbiddenException("Cannot change the category slug.");
    }

    // Handle parent category update
    if (updateCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({where:{ id: updateCategoryDto.parentId}});
      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID ${updateCategoryDto.parentId} not found`
        );
      }
      category.parent = parentCategory;
    } else if (updateCategoryDto.parentId === null) {
      // Allow setting parent to null (making it a root category)
      category.parent = null;
    }


    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string, user: UserEntity): Promise<void> {
      if (!user.roles.includes('admin')) {
          throw new ForbiddenException("Only admins can delete categories.");
      }
    const category = await this.categoryRepository.findByIdOrFail(id);

    // Check for child categories or products (optional, depending on your requirements)
    if (category.children && category.children.length > 0) {
      throw new ConflictException(
        "Cannot delete category with child categories."
      );
    }

    // if (category.products && category.products.length > 0) {
    //   throw new ConflictException("Cannot delete category with associated products.");
    // }

    await this.categoryRepository.delete(id);
  }
}