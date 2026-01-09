import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsQueryDto, TimePeriod } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private buildDateFilter(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    return where;
  }

  async getSummary(userId: string, query: AnalyticsQueryDto) {
    const { startDate, endDate } = query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    const where = {
      userId,
      ...this.buildDateFilter(startDate, endDate),
    };

    // Get total expenses
    const totalResult = await this.prisma.expense.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        amount: true,
      },
      _min: {
        amount: true,
      },
      _max: {
        amount: true,
      },
    });

    // Get total by category
    const categoryBreakdown = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get category details
    const categoryIds = categoryBreakdown.map((item) => item.categoryId);
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        userId,
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
    });

    // Combine category breakdown with category details
    const categorySummary = categoryBreakdown.map((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        category: category || null,
        total: item._sum.amount || 0,
        count: item._count.id,
      };
    });

    return {
      total: totalResult._sum.amount || 0,
      count: totalResult._count.id,
      average: totalResult._avg.amount || 0,
      min: totalResult._min.amount || 0,
      max: totalResult._max.amount || 0,
      byCategory: categorySummary,
    };
  }

  async getTrends(userId: string, query: AnalyticsQueryDto) {
    const { startDate, endDate, period = TimePeriod.DAILY } = query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Set default date range if not provided (last 30 days)
    const defaultEndDate = endDate ? new Date(endDate) : new Date();
    const defaultStartDate = startDate
      ? new Date(startDate)
      : new Date(defaultEndDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const where = {
      userId,
      date: {
        gte: defaultStartDate,
        lte: defaultEndDate,
      },
    };

    // Get all expenses in the date range
    const expenses = await this.prisma.expense.findMany({
      where,
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by period
    const grouped = this.groupByPeriod(expenses, period);

    return {
      period,
      startDate: defaultStartDate.toISOString(),
      endDate: defaultEndDate.toISOString(),
      data: grouped,
    };
  }

  private groupByPeriod(
    expenses: Array<{ amount: any; date: Date }>,
    period: TimePeriod,
  ): Array<{ date: string; total: number; count: number }> {
    const groups = new Map<string, { total: number; count: number }>();

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      let key: string;

      switch (period) {
        case TimePeriod.DAILY:
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case TimePeriod.WEEKLY:
          // Get week start (Monday)
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay() + 1);
          key = weekStart.toISOString().split('T')[0];
          break;
        case TimePeriod.MONTHLY:
          const month = String(date.getMonth() + 1);
          key = `${date.getFullYear()}-${month.length === 1 ? '0' + month : month}`;
          break;
        case TimePeriod.YEARLY:
          key = String(date.getFullYear());
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      const amount = Number(expense.amount);
      const existing = groups.get(key) || { total: 0, count: 0 };
      groups.set(key, {
        total: existing.total + amount,
        count: existing.count + 1,
      });
    });

    // Convert to array and sort by date
    return Array.from(groups.entries())
      .map(([date, data]) => ({
        date,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCategoryBreakdown(userId: string, query: AnalyticsQueryDto) {
    const { startDate, endDate } = query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    const where = {
      userId,
      ...this.buildDateFilter(startDate, endDate),
    };

    // Get expenses grouped by category
    const categoryBreakdown = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        amount: true,
      },
    });

    // Get category details
    const categoryIds = categoryBreakdown.map((item) => item.categoryId);
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        userId,
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
    });

    // Calculate total for percentage calculation
    const total = categoryBreakdown.reduce(
      (sum, item) => sum + Number(item._sum.amount || 0),
      0,
    );

    // Combine and calculate percentages
    const breakdown = categoryBreakdown
      .map((item) => {
        const category = categories.find((cat) => cat.id === item.categoryId);
        const categoryTotal = Number(item._sum.amount || 0);
        return {
          categoryId: item.categoryId,
          category: category || null,
          total: categoryTotal,
          count: item._count.id,
          average: Number(item._avg.amount || 0),
          percentage: total > 0 ? (categoryTotal / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total); // Sort by total descending

    return {
      total,
      breakdown,
    };
  }

  async getTimePeriodAnalysis(userId: string, query: AnalyticsQueryDto) {
    const { startDate, endDate, period = TimePeriod.MONTHLY } = query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Set default date range if not provided
    const defaultEndDate = endDate ? new Date(endDate) : new Date();
    let defaultStartDate: Date;

    if (startDate) {
      defaultStartDate = new Date(startDate);
    } else {
      // Default to last 12 periods based on selected period
      switch (period) {
        case TimePeriod.DAILY:
          defaultStartDate = new Date(defaultEndDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case TimePeriod.WEEKLY:
          defaultStartDate = new Date(defaultEndDate.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
          break;
        case TimePeriod.MONTHLY:
          defaultStartDate = new Date(defaultEndDate);
          defaultStartDate.setMonth(defaultStartDate.getMonth() - 12);
          break;
        case TimePeriod.YEARLY:
          defaultStartDate = new Date(defaultEndDate);
          defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 5);
          break;
        default:
          defaultStartDate = new Date(defaultEndDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    const where = {
      userId,
      date: {
        gte: defaultStartDate,
        lte: defaultEndDate,
      },
    };

    // Get expenses
    const expenses = await this.prisma.expense.findMany({
      where,
      select: {
        amount: true,
        date: true,
        categoryId: true,
      },
    });

    // Group by period
    const grouped = this.groupByPeriod(expenses, period);

    // Get category breakdown for each period
    const periodData = await Promise.all(
      grouped.map(async (periodItem) => {
        // Parse period date based on period type
        let periodStart: Date;
        let periodEnd: Date;

        switch (period) {
          case TimePeriod.DAILY:
            periodStart = new Date(periodItem.date);
            periodEnd = new Date(periodItem.date);
            periodEnd.setHours(23, 59, 59, 999);
            break;
          case TimePeriod.WEEKLY:
            periodStart = new Date(periodItem.date);
            periodEnd = new Date(periodStart);
            periodEnd.setDate(periodStart.getDate() + 6);
            periodEnd.setHours(23, 59, 59, 999);
            break;
          case TimePeriod.MONTHLY:
            const [year, month] = periodItem.date.split('-').map(Number);
            periodStart = new Date(year, month - 1, 1);
            periodEnd = new Date(year, month, 0, 23, 59, 59, 999);
            break;
          case TimePeriod.YEARLY:
            const yearNum = Number(periodItem.date);
            periodStart = new Date(yearNum, 0, 1);
            periodEnd = new Date(yearNum, 11, 31, 23, 59, 59, 999);
            break;
          default:
            periodStart = new Date(periodItem.date);
            periodEnd = new Date(periodItem.date);
        }

        const periodExpenses = await this.prisma.expense.findMany({
          where: {
            userId,
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          select: {
            categoryId: true,
            amount: true,
          },
        });

        // Group by category for this period
        const categoryMap = new Map<string, number>();
        periodExpenses.forEach((exp) => {
          const current = categoryMap.get(exp.categoryId) || 0;
          categoryMap.set(exp.categoryId, current + Number(exp.amount));
        });

        return {
          ...periodItem,
          byCategory: Array.from(categoryMap.entries()).map(([categoryId, total]) => ({
            categoryId,
            total,
          })),
        };
      }),
    );

    return {
      period,
      startDate: defaultStartDate.toISOString(),
      endDate: defaultEndDate.toISOString(),
      data: periodData,
    };
  }
}
