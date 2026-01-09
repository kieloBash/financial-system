import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        userId,
        name: createCategoryDto.name,
        color: createCategoryDto.color,
        icon: createCategoryDto.icon,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }

    return category;
  }

  async update(id: string, userId: string, updateCategoryDto: UpdateCategoryDto) {
    // First check if category exists and belongs to user
    await this.findOne(id, userId);

    return this.prisma.category.update({
      where: { id },
      data: {
        name: updateCategoryDto.name,
        color: updateCategoryDto.color,
        icon: updateCategoryDto.icon,
      },
    });
  }

  async remove(id: string, userId: string) {
    // First check if category exists and belongs to user
    await this.findOne(id, userId);

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
