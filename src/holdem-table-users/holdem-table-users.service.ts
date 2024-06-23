import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
/* Entities */
import { HoldemTableUser } from 'src/holdem-table-users/entities/holdem-table-user.entity';
/* DTOs */
import { CreateHoldemTableUserDto } from 'src/holdem-table-users/dto/create-holdem-table-user.dto';

@Injectable()
export class HoldemTableUsersService {
  constructor(
    @InjectRepository(HoldemTableUser)
    private readonly holdemTableUsersRepository: Repository<HoldemTableUser>,
  ) {}

  async create(createHoldemTableUserDto: CreateHoldemTableUserDto): Promise<HoldemTableUser> {
    const holdemTableUser = this.holdemTableUsersRepository.create(createHoldemTableUserDto);
    return await this.holdemTableUsersRepository.save(holdemTableUser);
  }

  async findOne(id: number): Promise<HoldemTableUser | null> {
    return await this.holdemTableUsersRepository.findOneBy({ id });
  }

  async findByHoldemTableAndUser(holdemTableId: number, userId: number): Promise<HoldemTableUser | null> {
    return await this.holdemTableUsersRepository.findOne({ where: { holdemTableId, userId } });
  }

  async createFromReadyData(data: Record<string, any>): Promise<HoldemTableUser> {
    return await this.holdemTableUsersRepository.save(data);
  }

  async deleteAll(): Promise<void> {
    await this.holdemTableUsersRepository.delete({});
  }
}
