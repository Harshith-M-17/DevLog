import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type EntryDocument = Entry & Document;

@Schema({ timestamps: true, collection: 'entries' })
export class Entry {
  @ApiProperty({ description: 'What was accomplished today' })
  @Prop({ required: true })
  workDone: string;

  @ApiProperty({ description: 'Any blockers or impediments' })
  @Prop({ required: true })
  blockers: string;

  @ApiProperty({ description: 'Key learnings from the day' })
  @Prop({ required: true })
  learnings: string;

  @ApiProperty({ description: 'Optional GitHub commit or PR URL', required: false })
  @Prop()
  githubCommitLink?: string;

  @ApiProperty({ description: 'Date of the log entry' })
  @Prop({ type: Date, default: Date.now })
  date: Date;

  @ApiProperty({ description: 'Author (user) reference' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const EntrySchema = SchemaFactory.createForClass(Entry);

// Indexes for common queries
EntrySchema.index({ userId: 1, date: -1 });
