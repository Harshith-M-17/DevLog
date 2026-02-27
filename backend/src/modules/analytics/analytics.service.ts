import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Entry, EntryDocument } from '../entries/schemas/entry.schema';
import { UsersService } from '../users/users.service';
import { UserStatsDto, TeamOverviewDto } from './dto/analytics-response.dto';

/**
 * AnalyticsService — aggregation logic only.
 * Depends on abstractions (UsersService & Entry model), not concrete routes.
 */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Entry.name) private readonly entryModel: Model<EntryDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const totalEntries = await this.entryModel
      .countDocuments({ userId })
      .exec();
    return { totalEntries };
  }

  async getTeamOverview(): Promise<TeamOverviewDto> {
    const users = await this.usersService.findAll();
    const members = users.map((u) => ({
      id: (u as any)._id.toString(),
      name: u.name,
      email: u.email,
      team: u.team,
    }));
    return { members };
  }
}
