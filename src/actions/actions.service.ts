import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
/* Entities */
import { Action } from 'src/actions/entities/action.entity';

@Injectable()
export class ActionsService {
  constructor(
    @InjectRepository(Action)
    private readonly actionsRepository: Repository<Action>,
  ) {}

  async createByStatus(data: Record<string, any>): Promise<Action> {
    return await this.actionsRepository.save(data);
  }

  async deleteAll(): Promise<void> {
    await this.actionsRepository.delete({});
  }

}
