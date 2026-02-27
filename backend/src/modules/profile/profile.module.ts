import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [UsersModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
