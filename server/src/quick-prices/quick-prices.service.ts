import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuickPriceDto } from './dto/create-quick-price.dto';
import { UpdateQuickPriceDto } from './dto/update-quick-price.dto';
import { CreateExpenseFromQuickPriceDto } from './dto/create-expense-from-quick-price.dto';

@Injectable()
export class QuickPricesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createQuickPriceDto: CreateQuickPriceDto) {
    // Verify category exists and belongs to user
    const category = await this.prisma.category.findUnique({
      where: { id: createQuickPriceDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${createQuickPriceDto.categoryId} not found`);
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }

    return this.prisma.quickPrice.create({
      data: {
        userId,
        categoryId: createQuickPriceDto.categoryId,
        name: createQuickPriceDto.name,
        amount: createQuickPriceDto.amount,
        description: createQuickPriceDto.description,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.quickPrice.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const quickPrice = await this.prisma.quickPrice.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    if (!quickPrice) {
      throw new NotFoundException(`Quick price with ID ${id} not found`);
    }

    if (quickPrice.userId !== userId) {
      throw new ForbiddenException('You do not have access to this quick price');
    }

    return quickPrice;
  }

  async update(id: string, userId: string, updateQuickPriceDto: UpdateQuickPriceDto) {
    // First check if quick price exists and belongs to user
    const existingQuickPrice = await this.findOne(id, userId);

    // If categoryId is being updated, verify the new category exists and belongs to user
    if (updateQuickPriceDto.categoryId && updateQuickPriceDto.categoryId !== existingQuickPrice.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateQuickPriceDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${updateQuickPriceDto.categoryId} not found`);
      }

      if (category.userId !== userId) {
        throw new ForbiddenException('You do not have access to this category');
      }
    }

    return this.prisma.quickPrice.update({
      where: { id },
      data: {
        categoryId: updateQuickPriceDto.categoryId,
        name: updateQuickPriceDto.name,
        amount: updateQuickPriceDto.amount,
        description: updateQuickPriceDto.description,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // First check if quick price exists and belongs to user
    await this.findOne(id, userId);

    return this.prisma.quickPrice.delete({
      where: { id },
    });
  }

  async createExpenseFromQuickPrice(
    id: string,
    userId: string,
    createExpenseDto?: CreateExpenseFromQuickPriceDto,
  ) {
    // Get the quick price
    const quickPrice = await this.findOne(id, userId);

    // Parse the date or use current date
    const expenseDate = createExpenseDto?.date
      ? new Date(createExpenseDto.date)
      : new Date();

    // Verify the date is valid
    if (isNaN(expenseDate.getTime())) {
      throw new BadRequestException('Invalid date format. Please use ISO date string.');
    }

    // Verify category still exists
    const category = await this.prisma.category.findUnique({
      where: { id: quickPrice.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category associated with this quick price no longer exists');
    }

    // Create expense from quick price
    const expense = await this.prisma.expense.create({
      data: {
        userId,
        categoryId: quickPrice.categoryId,
        amount: quickPrice.amount,
        description: createExpenseDto?.description || quickPrice.description || undefined,
        date: expenseDate,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return expense;
  }
}
