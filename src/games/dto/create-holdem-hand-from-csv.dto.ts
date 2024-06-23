import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { HandStatus } from 'src/common/enums/hand-status.enum';
import { HoldemHand } from '../entities/holdem-hand.entity';
import { Actor } from 'src/common/enums/actor.enum';

export class CreateHoldemHandFromCsvDto extends PartialType(HoldemHand) {
  holdemTableId: number;

  @Transform(({ value }) => {
    return (typeof value == 'string') ?
      HandStatus[value.toUpperCase() as keyof typeof HandStatus] :
      value;
  }, { toClassOnly: true })
  status: HandStatus;

  @Transform(({ value }) => {
    return (typeof value == 'string') ?
      Actor[value.toUpperCase() as keyof typeof Actor] :
      value;
  }, { toClassOnly: true }) // 문자열을 enum 값으로 변환
  actor?: Actor;
}
