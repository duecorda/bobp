/* Mandatory */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
/* Entities */
import { HoldemTable } from 'src/games/entities/holdem-table.entity';
import { HoldemHand } from 'src/games/entities/holdem-hand.entity';
import { Board } from 'src/games/entities/board.entity';
/* DTOs */
import { CreateHoldemTableFromCsvDto } from 'src/games/dto/create-holdem-table-from-csv.dto';
import { CreateHoldemHandFromCsvDto } from './dto/create-holdem-hand-from-csv.dto';
import { HandStatus } from 'src/common/enums/hand-status.enum';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(HoldemTable)
    private readonly holdemTablesRepository: Repository<HoldemTable>,
    @InjectRepository(HoldemHand)
    private readonly holdemHandsRepository: Repository<HoldemHand>,
    @InjectRepository(Board)
    private readonly boardsRepository: Repository<Board>,
  ) {}

  async createHoldemTableFromCsv(createHoldemTableByCsvDto: CreateHoldemTableFromCsvDto): Promise<HoldemTable> {
    const holdemTableDto = plainToInstance(CreateHoldemTableFromCsvDto, createHoldemTableByCsvDto)
    const errors = await validate(holdemTableDto);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors}`);
    }

    return this.holdemTablesRepository.save(holdemTableDto);
  }
  async createHoldemHandFromCsv(createHoldemHandByCsvDto: CreateHoldemHandFromCsvDto): Promise<HoldemHand> {
    const holdemHand = plainToInstance(CreateHoldemHandFromCsvDto, createHoldemHandByCsvDto)
    const errors = await validate(holdemHand);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors}`);
    }

    return this.holdemHandsRepository.save(holdemHand);
  }

  async createBoardFromReadyData(data: Record<string, any>): Promise<Board> {
    return await this.boardsRepository.save(data);
  }

  async findOneHoldemTable(id: number): Promise<HoldemTable | null> {
    return await this.holdemTablesRepository.findOneBy({ id });
  }
  async findOneHoldemHand(id: number): Promise<HoldemHand | null> {
    return await this.holdemHandsRepository.findOneBy({ id });
  }

  async findHoldemHandByUser(userId: number): Promise<HoldemHand[]> {
    return this.holdemHandsRepository
      .createQueryBuilder('hand')
      .innerJoin('hand.holdemHandUsers', 'handUser')
      .where('handUser.user.id = :userId', { userId })
      .getMany();
  }

  async findHoldemHandByTableAndHandNumber(holdemTableId: number, handNumber: number): Promise<HoldemHand | null> {
    return await this.holdemHandsRepository.findOneBy({ holdemTableId, handNumber });
  }
  async findBoardByHoldemHandId(holdemHandId: number): Promise<Board | null> {
    return await this.boardsRepository.findOneBy({ holdemHandId });
  }

  async updateHoldemHandCompletedAt(holdemHandId: number, completedAt: Date): Promise<HoldemHand> {
    const holdemHand = await this.holdemHandsRepository.findOneBy({ id: holdemHandId });
    if (!holdemHand) {
      throw new Error('HoldemHand not found');
    }
    holdemHand.completedAt = completedAt;
    holdemHand.status = HandStatus.COMPLETE;
    return await this.holdemHandsRepository.save(holdemHand);
  }

  async updateBoardFlopCards(holdemHandId: number, data: Record<string, any>): Promise<Board> {
    const board = await this.boardsRepository.findOneBy({ holdemHandId });
    if (!board) {
      throw new Error('Board not found');
    }
    board.flop1 = data['flop1'];
    board.flop2 = data['flop2'];
    board.flop3 = data['flop3'];
    board.flopTime = data['flopTime'];
    return await this.boardsRepository.save(board);
  }
  async updateBoardTurnCard(holdemHandId: number, data: Record<string, any>): Promise<Board> {
    const board = await this.boardsRepository.findOneBy({ holdemHandId });
    if (!board) {
      throw new Error('Board not found');
    }
    board.turn = data['turn'];
    board.turnTime = data['turnTime'];
    return await this.boardsRepository.save(board);
  }
  async updateBoardRiverCard(holdemHandId: number, data: Record<string, any>): Promise<Board> {
    const board = await this.boardsRepository.findOneBy({ holdemHandId });
    if (!board) {
      throw new Error('Board not found');
    }
    board.river = data['river'];
    board.riverTime = data['riverTime'];
    return await this.boardsRepository.save(board);
  }

  async deleteAllHoldemTables(): Promise<void> {
    await this.holdemTablesRepository.delete({});
  }
  async deleteAllHoldemHands(): Promise<void> {
    await this.holdemHandsRepository.delete({});
  }
  async deleteAllBoards(): Promise<void> {
    await this.boardsRepository.delete({});
  }
}
