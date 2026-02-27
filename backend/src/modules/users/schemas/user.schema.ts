import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @ApiProperty({ description: 'Full display name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Unique email address' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({ description: 'Team or squad the user belongs to', default: '' })
  @Prop({ default: '' })
  team: string;

  @ApiProperty({ enum: UserRole, description: 'Access role', default: UserRole.MEMBER })
  @Prop({ type: String, enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
