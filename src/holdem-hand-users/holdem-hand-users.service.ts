import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
/* Entities */
import { HoldemHandUser } from 'src/holdem-hand-users/entities/holdem-hand-user.entity';
/* DTOs */
import { CreateHoldemHandUserDto } from 'src/holdem-hand-users/dto/create-holdem-hand-user.dto';
import Decimal from 'decimal.js';
import { ActionType } from 'src/common/enums/action-type';

@Injectable()
export class HoldemHandUsersService {
  constructor(
    @InjectRepository(HoldemHandUser)
    private readonly holdemHandUsersRepository: Repository<HoldemHandUser>,
  ) {}

  async create(createHoldemHandUserDto: CreateHoldemHandUserDto): Promise<HoldemHandUser> {
    const holdemHandUser = await this.holdemHandUsersRepository.create(createHoldemHandUserDto);
    return await this.holdemHandUsersRepository.save(holdemHandUser);
  }

  async findOne(id: number): Promise<HoldemHandUser | null> {
    return await this.holdemHandUsersRepository.findOneBy({ id });
  }

  async findByHoldemHandAndUser(holdemHandId: number, userId: number): Promise<HoldemHandUser | null> {
    return await this.holdemHandUsersRepository.findOne({ where: { holdemHandId, userId } });
  }
  async findByHoldemHandAndSeat(holdemHandId: number, seatNumber: number): Promise<HoldemHandUser | null> {
    return await this.holdemHandUsersRepository.findOne({ where: { holdemHandId, seatNumber } });
  }

  async createFromReadyData(data: Record<string, any>): Promise<HoldemHandUser> {
    return await this.holdemHandUsersRepository.save(data);
  }

  async updateHoleCards(id: number, holeCards: Record<string, string>): Promise<HoldemHandUser> {
    const holdemHandUser = await this.holdemHandUsersRepository.findOneBy({ id });
    if (!holdemHandUser) {
      throw new Error('HoldemHandUser not found');
    }
    holdemHandUser.holeCard1 = holeCards['holeCard1'];
    holdemHandUser.holeCard2 = holeCards['holeCard2'];
    return await this.holdemHandUsersRepository.save(holdemHandUser);
  }

  async updateWinAmount(id: number, winAmount: number): Promise<HoldemHandUser> {
    const holdemHandUser = await this.holdemHandUsersRepository.findOneBy({ id });
    if (!holdemHandUser) {
      throw new Error('HoldemHandUser not found');
    }
    holdemHandUser.isWinner = true;
    holdemHandUser.winAmount = winAmount;
    return await this.holdemHandUsersRepository.save(holdemHandUser);
  }

  async updateAllCompletedAt(holdemHandId: number, completedAt: Date): Promise<void> {
    await this.holdemHandUsersRepository.update({ holdemHandId }, { completedAt: completedAt });
  }

  async deleteAll(): Promise<void> {
    await this.holdemHandUsersRepository.delete({});
  }

  async gameDataByUser(userId: number, startDate?: Date, endDate?: Date): Promise<any> {
    const queryBuilder = this.holdemHandUsersRepository
      .createQueryBuilder('handUser')
      .leftJoinAndSelect('handUser.holdemHand', 'hand')
      .leftJoinAndSelect('hand.actions', 'action')
      .where('handUser.user.id = :userId', { userId })
      .andWhere('action.userId = :userId', { userId });
    
    if (startDate && endDate) {
      queryBuilder.andWhere('hand.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const gameData = await queryBuilder.getMany();

    let profit = new Decimal(0);
    let totalBettingCount = 0;
    let totalBettingAmount = new Decimal(0);
    const aggregated = {
      totalProfit: 0,
      playtime: 0,
      handCount: gameData.length,
      winHandCount: 0,
      winningRate: 0,
      winnings: '',
      peakTime: '',
      cashGameProfit: 0,
      avgProfitPer100Hands: 0,
      avgProfitPerHour: 0,
      avgBetSize: 0
    }
    const timeRange: { [key: string]: number } = { 'UTC+0': 0, 'UTC+6': 0, 'UTC+12': 0, 'UTC+18': 0 };

    for (const data of gameData) {
      if (data.isWinner) {
        profit = profit.plus(new Decimal(data.winAmount));
        aggregated.winHandCount++;
      }
      if (data.completedAt && data.createdAt) {
        aggregated.playtime += (data.completedAt.getTime() - data.createdAt.getTime());
      }

      data.createdAt.getHours() < 6 ? timeRange['UTC+0']++ :
      data.createdAt.getHours() < 12 ? timeRange['UTC+6']++ :
      data.createdAt.getHours() < 18 ? timeRange['UTC+12']++ : timeRange['UTC+18']++;

      data.holdemHand.actions.map((action: Record<string, any>) => {
        if ([
          ActionType.BET,
          ActionType.RAISE,
          ActionType.CALL,
          ActionType.ALL_IN
        ].includes(action.actionType)) {
          totalBettingAmount = totalBettingAmount.plus(new Decimal(action.amount));
          totalBettingCount++;
        }
      })
    }
    aggregated.peakTime = Object.keys(timeRange).reduce((a, b) => timeRange[a] > timeRange[b] ? a : b);
    aggregated.totalProfit = profit.toNumber();
    aggregated.cashGameProfit = aggregated.totalProfit;
    aggregated.playtime = aggregated.playtime / 1000;
    aggregated.avgBetSize = Math.round(totalBettingAmount.dividedBy(totalBettingCount).toNumber());
    aggregated.avgProfitPer100Hands = Math.round(aggregated.totalProfit / aggregated.handCount * 100);
    aggregated.avgProfitPerHour = Math.round(aggregated.totalProfit / (aggregated.playtime / 3600));
    aggregated.winningRate = Math.round(aggregated.winHandCount / aggregated.handCount * 100);
    aggregated.winnings = `${aggregated.winHandCount} (${aggregated.winningRate}%)`;

    return aggregated;
  }
}