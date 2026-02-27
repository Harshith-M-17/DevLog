import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { EntryResponseDto } from './dto/entry-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@ApiTags('entries')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a daily log entry' })
  @ApiResponse({ status: 201, type: EntryResponseDto })
  create(
    @Body() dto: CreateEntryDto,
    @CurrentUser() user: UserDocument,
  ): Promise<EntryResponseDto> {
    return this.entriesService.create(dto, (user as any)._id.toString());
  }

  @Get()
  @ApiOperation({ summary: 'Get all log entries (team view)' })
  @ApiResponse({ status: 200, type: [EntryResponseDto] })
  findAll(): Promise<EntryResponseDto[]> {
    return this.entriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single entry by ID' })
  @ApiParam({ name: 'id', description: 'Entry MongoDB ObjectId' })
  @ApiResponse({ status: 200, type: EntryResponseDto })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<EntryResponseDto> {
    return this.entriesService.findOne(id, (user as any)._id.toString());
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an entry (owner only)' })
  @ApiParam({ name: 'id', description: 'Entry MongoDB ObjectId' })
  @ApiResponse({ status: 200, type: EntryResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
    @CurrentUser() user: UserDocument,
  ): Promise<EntryResponseDto> {
    return this.entriesService.update(id, dto, (user as any)._id.toString());
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an entry (owner only)' })
  @ApiParam({ name: 'id', description: 'Entry MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Entry deleted' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    return this.entriesService.remove(id, (user as any)._id.toString());
  }
}
