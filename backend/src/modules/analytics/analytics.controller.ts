import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { UserStatsDto, TeamOverviewDto } from './dto/analytics-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @ApiOperation({ summary: "Get current user's entry statistics" })
  @ApiResponse({ status: 200, type: UserStatsDto })
  getStats(@CurrentUser() user: UserDocument): Promise<UserStatsDto> {
    return this.analyticsService.getUserStats((user as any)._id.toString());
  }

  @Get('team')
  @ApiOperation({ summary: 'Get team members overview' })
  @ApiResponse({ status: 200, type: TeamOverviewDto })
  getTeam(): Promise<TeamOverviewDto> {
    return this.analyticsService.getTeamOverview();
  }
}
