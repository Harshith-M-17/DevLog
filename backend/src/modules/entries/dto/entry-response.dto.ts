import { ApiProperty } from '@nestjs/swagger';

export class EntryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  workDone: string;

  @ApiProperty()
  blockers: string;

  @ApiProperty()
  learnings: string;

  @ApiProperty({ required: false })
  githubCommitLink?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
