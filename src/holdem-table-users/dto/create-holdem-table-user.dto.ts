export class CreateHoldemTableUserDto {
  id: number;
  holdemTableId: number;
  userId: number;
  startingStack?: number;
  endingStack?: number;
  seatNumber?: number;
}
