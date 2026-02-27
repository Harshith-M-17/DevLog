import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntryDto {
  @ApiProperty({ description: 'Summary of work completed today' })
  @IsString()
  @IsNotEmpty()
  workDone: string;

  @ApiProperty({ description: 'Blockers or impediments faced' })
  @IsString()
  @IsNotEmpty()
  blockers: string;

  @ApiProperty({ description: 'Key learnings or insights' })
  @IsString()
  @IsNotEmpty()
  learnings: string;

  @ApiProperty({ description: 'GitHub commit / PR URL', required: false })
  @IsOptional()
  @IsUrl({ require_protocol: false })
  githubCommitLink?: string;
}
