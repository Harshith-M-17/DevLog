import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UserDocument } from '../users/schemas/user.schema';

/**
 * ProfileService — owns the read/update profile use-cases.
 * Delegates storage to UsersService (Dependency Inversion).
 */
@Injectable()
export class ProfileService {
  constructor(private readonly usersService: UsersService) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.usersService.findById(userId);
    return this.toDto(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const updated = await this.usersService.update(userId, dto);
    return this.toDto(updated);
  }

  private toDto(user: UserDocument): ProfileResponseDto {
    return {
      id: (user as any)._id.toString(),
      name: user.name,
      email: user.email,
      team: user.team,
      role: user.role,
    };
  }
}
