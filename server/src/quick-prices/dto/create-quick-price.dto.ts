import { IsNotEmpty, IsOptional, IsString, IsNumberString, MinLength } from 'class-validator';

export class CreateQuickPriceDto {
  @IsNotEmpty({ message: 'Category ID is required' })
  @IsString({ message: 'Category ID must be a string' })
  categoryId: string;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  name: string;

  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumberString({}, { message: 'Amount must be a valid number' })
  amount: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
