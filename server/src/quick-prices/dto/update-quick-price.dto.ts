import { IsOptional, IsString, IsNumberString, MinLength } from 'class-validator';

export class UpdateQuickPriceDto {
  @IsOptional()
  @IsString({ message: 'Category ID must be a string' })
  categoryId?: string;

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  name?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Amount must be a valid number' })
  amount?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
