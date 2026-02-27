import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ description: 'Total entries authored by the current user' })
  totalEntries: number;
}

export class TeamMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  team: string;
}

export class TeamOverviewDto {
  @ApiProperty({ type: [TeamMemberDto] })
  members: TeamMemberDto[];
}
