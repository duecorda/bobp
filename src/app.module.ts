import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
/* Modules */
import { AuthModule } from 'src/auth/auth.module';
import { MembersModule } from 'src/members/members.module';
import { CsvModule } from 'src/csv/csv.module';
import { UsersModule } from 'src/users/users.module';
import { GamesModule } from './games/games.module';
/* Configs */
import { ormConfig } from 'src/configs/ormconfig';
import { HoldemHandUsersModule } from './holdem-hand-users/holdem-hand-users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: ormConfig,
    }),
    AuthModule,
    MembersModule,
    CsvModule,
    UsersModule,
    GamesModule,
    HoldemHandUsersModule
  ],
  controllers: [],
  providers: [],
})

export class AppModule {
  constructor(private readonly dataSource: DataSource) {}
}
