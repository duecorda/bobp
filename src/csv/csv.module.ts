import { Module } from '@nestjs/common';
/* Controllers */
import { CsvController } from 'src/csv/csv.controller';
/* Services */
import { UsersService } from 'src/users/users.service';
import { GamesService } from 'src/games/games.service';
import { CsvService } from 'src/csv/csv.service';
/* Modules */
import { UsersModule } from 'src/users/users.module';
import { GamesModule } from 'src/games/games.module';
import { HoldemTableUsersService } from 'src/holdem-table-users/holdem-table-users.service';
import { HoldemTableUsersModule } from 'src/holdem-table-users/holdem-table-users.module';
import { HoldemHandUsersService } from 'src/holdem-hand-users/holdem-hand-users.service';
import { HoldemHandUsersModule } from 'src/holdem-hand-users/holdem-hand-users.module';
import { ActionsService } from 'src/actions/actions.service';
import { ActionsModule } from 'src/actions/actions.module';

@Module({
  imports: [
    UsersModule,
    GamesModule,
    HoldemTableUsersModule,
    HoldemHandUsersModule,
    ActionsModule],
  providers: [
    CsvService,
    UsersService,
    GamesService,
    HoldemTableUsersService,
    HoldemHandUsersService,
    ActionsService
  ],
  controllers: [CsvController],
})
export class CsvModule {}
