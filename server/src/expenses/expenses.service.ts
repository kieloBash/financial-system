import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpensesDto, ExpenseSortBy, SortOrder } from './dto/query-expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto) {
    // Verify category exists and belongs to user
    const category = await this.prisma.category.findUnique({
      where: { id: createExpenseDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${createExpenseDto.categoryId} not found`);
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }

    const expenseDate = createExpenseDto.date ? new Date(createExpenseDto.date) : new Date();

    return this.prisma.expense.create({
      data: {
        userId,
        categoryId: createExpenseDto.categoryId,
        amount: createExpenseDto.amount,
        description: createExpenseDto.description,
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
  }

  async findAll(userId: string, query: QueryExpensesDto) {
    const {
      categoryId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
      sortBy = ExpenseSortBy.DATE,
      sortOrder = SortOrder.DESC,
    } = query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate amount range
    if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
      throw new BadRequestException('Min amount must be less than or equal to max amount');
    }

    // Build where clause
    const where: any = { userId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount.lte = maxAmount;
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.expense.count({ where });

    // Get expenses
    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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

    return {
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
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

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException('You do not have access to this expense');
    }

    return expense;
  }

  async update(id: string, userId: string, updateExpenseDto: UpdateExpenseDto) {
    // First check if expense exists and belongs to user
    const existingExpense = await this.findOne(id, userId);

    // If categoryId is being updated, verify new category exists and belongs to user
    if (updateExpenseDto.categoryId && updateExpenseDto.categoryId !== existingExpense.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateExpenseDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${updateExpenseDto.categoryId} not found`);
      }

      if (category.userId !== userId) {
        throw new ForbiddenException('You do not have access to this category');
      }
    }

    const updateData: any = {};

    if (updateExpenseDto.categoryId !== undefined) {
      updateData.categoryId = updateExpenseDto.categoryId;
    }
    if (updateExpenseDto.amount !== undefined) {
      updateData.amount = updateExpenseDto.amount;
    }
    if (updateExpenseDto.description !== undefined) {
      updateData.description = updateExpenseDto.description;
    }
    if (updateExpenseDto.date !== undefined) {
      updateData.date = new Date(updateExpenseDto.date);
    }

    return this.prisma.expense.update({
      where: { id },
      data: updateData,
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
    // First check if expense exists and belongs to user
    await this.findOne(id, userId);

    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
