import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesModule } from 'src/games/games.module';
import { GamesService } from 'src/games/games.service';
import { HoldemHandUsersModule } from 'src/holdem-hand-users/holdem-hand-users.module';
import { HoldemHandUsersService } from 'src/holdem-hand-users/holdem-hand-users.service';
/* Entities */
import { User } from 'src/users/entities/user.entity';
/* Controllers */
import { UsersController } from 'src/users/users.controller';
/* Services */
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), GamesModule, HoldemHandUsersModule],
  exports: [TypeOrmModule],
  controllers: [UsersController],
  providers: [UsersService, GamesService, HoldemHandUsersService],
})
export class UsersModule {}
