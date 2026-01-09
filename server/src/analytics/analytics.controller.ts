import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { CurrentUser, type CurrentUserPayload } from '../decorators/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  getSummary(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.analyticsService.getSummary(user.userId, query);
  }

  @Get('trends')
  getTrends(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.analyticsService.getTrends(user.userId, query);
  }

  @Get('category-breakdown')
  getCategoryBreakdown(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.analyticsService.getCategoryBreakdown(user.userId, query);
  }

  @Get('time-period')
  getTimePeriodAnalysis(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.analyticsService.getTimePeriodAnalysis(user.userId, query);
  }
}
