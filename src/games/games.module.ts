import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
/* Entities */
import { HoldemTable } from 'src/games/entities/holdem-table.entity';
/* Services */
import { GamesService } from 'src/games/games.service';
import { HoldemHand } from './entities/holdem-hand.entity';
import { Board } from './entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    HoldemTable, HoldemHand, Board
  ])],
  exports: [TypeOrmModule],
  controllers: [],
  providers: [GamesService],
})
export class GamesModule {}
