export class CreateHoldemHandUserDto {
  id: number;
  holdemHandId: number;
  userId: number;
  holeCard1?: string;
  holeCard2?: string;
  isWinner?: boolean;
  winAmount?: number;
}