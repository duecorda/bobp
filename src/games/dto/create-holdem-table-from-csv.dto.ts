import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
/* Enums */
import { GameType } from 'src/common/enums/game-type.enum';
import { GameStatus } from 'src/common/enums/game-status.enum';
/* Entities */
import { HoldemTable } from '../entities/holdem-table.entity';

export class CreateHoldemTableFromCsvDto extends PartialType(HoldemTable) {
  id: number;

  @Transform(({ value }) => {
    return (typeof value == 'string') ?
      GameType[value.toUpperCase() as keyof typeof GameType] :
      value;
  }, { toClassOnly: true }) // 문자열을 enum 값으로 변환
  gameType?: GameType;

  @Transform(({ value }) => {
    return (typeof value == 'string') ?
      GameStatus[value.toUpperCase() as keyof typeof GameStatus] :
      value;
  }, { toClassOnly: true }) // 문자열을 enum 값으로 변환
  gameStatus?: GameStatus;
}