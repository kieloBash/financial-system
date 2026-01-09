import { IsOptional, IsString, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExpenseSortBy {
  DATE = 'date',
  AMOUNT = 'amount',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryExpensesDto {
  @IsOptional()
  @IsString({ message: 'Category ID must be a string' })
  categoryId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  endDate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Min amount must be a number' })
  @Type(() => Number)
  @Min(0, { message: 'Min amount must be greater than or equal to 0' })
  minAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Max amount must be a number' })
  @Type(() => Number)
  @Min(0, { message: 'Max amount must be greater than or equal to 0' })
  maxAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Type(() => Number)
  @Min(1, { message: 'Page must be greater than 0' })
  page?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Type(() => Number)
  @Min(1, { message: 'Limit must be greater than 0' })
  limit?: number;

  @IsOptional()
  @IsEnum(ExpenseSortBy, { message: 'Sort by must be one of: date, amount, createdAt' })
  sortBy?: ExpenseSortBy;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be asc or desc' })
  sortOrder?: SortOrder;
}
