import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuickPricesService } from './quick-prices.service';
import { CreateQuickPriceDto } from './dto/create-quick-price.dto';
import { UpdateQuickPriceDto } from './dto/update-quick-price.dto';
import { CreateExpenseFromQuickPriceDto } from './dto/create-expense-from-quick-price.dto';
import { CurrentUser, type CurrentUserPayload } from '../decorators/current-user.decorator';

@Controller('quick-prices')
export class QuickPricesController {
  constructor(private readonly quickPricesService: QuickPricesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createQuickPriceDto: CreateQuickPriceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quickPricesService.create(user.userId, createQuickPriceDto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.quickPricesService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.quickPricesService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuickPriceDto: UpdateQuickPriceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quickPricesService.update(id, user.userId, updateQuickPriceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.quickPricesService.remove(id, user.userId);
  }

  @Post(':id/create-expense')
  @HttpCode(HttpStatus.CREATED)
  createExpenseFromQuickPrice(
    @Param('id') id: string,
    @Body() createExpenseDto: CreateExpenseFromQuickPriceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quickPricesService.createExpenseFromQuickPrice(id, user.userId, createExpenseDto);
  }
}
