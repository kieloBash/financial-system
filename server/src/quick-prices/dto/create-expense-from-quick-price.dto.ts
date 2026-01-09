import { IsOptional, IsString } from 'class-validator';

export class CreateExpenseFromQuickPriceDto {
  @IsOptional()
  @IsString({ message: 'Date must be a valid ISO date string' })
  date?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
