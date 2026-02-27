import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { EntriesModule } from './modules/entries/entries.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UsersModule } from './modules/users/users.module';
import { ChatModule } from './modules/chat/chat.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    // Configuration — must be first so other modules can inject ConfigService
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [databaseConfig, jwtConfig],
    }),

    // MongoDB connection via Mongoose
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),

    // Feature modules
    UsersModule,
    AuthModule,
    EntriesModule,
    ProfileModule,
    AnalyticsModule,
    ChatModule,
  ],
})
export class AppModule {}
