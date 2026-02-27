import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Entry, EntryDocument } from './schemas/entry.schema';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { EntryResponseDto } from './dto/entry-response.dto';

/**
 * EntriesService — owns all entry persistence logic.
 * Dependency Inversion: consumers depend on this service interface, not Mongoose.
 */
@Injectable()
export class EntriesService {
  constructor(
    @InjectModel(Entry.name) private readonly entryModel: Model<EntryDocument>,
  ) {}

  async create(dto: CreateEntryDto, userId: string): Promise<EntryResponseDto> {
    const entry = await new this.entryModel({ ...dto, userId }).save();
    const populated = await entry.populate('userId', 'name');
    return this.toDto(populated);
  }

  async findAll(): Promise<EntryResponseDto[]> {
    const entries = await this.entryModel
      .find()
      .populate('userId', 'name')
      .sort({ date: -1 })
      .exec();
    return entries.map((e) => this.toDto(e));
  }

  async findOne(id: string, requestingUserId: string): Promise<EntryResponseDto> {
    const entry = await this.findByIdOrThrow(id);
    this.assertOwnership(entry, requestingUserId);
    return this.toDto(entry);
  }

  async update(
    id: string,
    dto: UpdateEntryDto,
    requestingUserId: string,
  ): Promise<EntryResponseDto> {
    const entry = await this.findByIdOrThrow(id);
    this.assertOwnership(entry, requestingUserId);

    const updated = await this.entryModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .populate('userId', 'name')
      .exec();

    return this.toDto(updated!);
  }

  async remove(id: string, requestingUserId: string): Promise<{ message: string }> {
    const entry = await this.findByIdOrThrow(id);
    this.assertOwnership(entry, requestingUserId);
    await this.entryModel.findByIdAndDelete(id).exec();
    return { message: 'Entry deleted successfully' };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async findByIdOrThrow(id: string): Promise<EntryDocument> {
    const entry = await this.entryModel.findById(id).populate('userId', 'name').exec();
    if (!entry) throw new NotFoundException(`Entry ${id} not found`);
    return entry;
  }

  private assertOwnership(entry: EntryDocument, userId: string): void {
    // entry.userId may be a populated User document (has ._id) or a raw ObjectId
    const entryUserId =
      (entry.userId as any)?._id?.toString() ?? entry.userId.toString();
    if (entryUserId !== userId) {
      throw new ForbiddenException('You do not own this entry');
    }
  }

  private toDto(entry: EntryDocument): EntryResponseDto {
    const user = entry.userId as any;
    return {
      id: (entry as any)._id.toString(),
      userId: user?._id?.toString() ?? user?.toString(),
      userName: user?.name ?? '',
      date: (entry as any).date?.toISOString(),
      workDone: entry.workDone,
      blockers: entry.blockers,
      learnings: entry.learnings,
      githubCommitLink: entry.githubCommitLink,
      createdAt: (entry as any).createdAt?.toISOString(),
      updatedAt: (entry as any).updatedAt?.toISOString(),
    };
  }
}
