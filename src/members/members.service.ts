import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
/* Entities */
import { Member } from 'src/members/entities/member.entity';
/* DTOs */
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
import { UpdateMemberDto } from 'src/members/dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const member = await this.membersRepository.create(createMemberDto);
    return await this.membersRepository.save(member);
  }

  async findAll(): Promise<Member[]> {
    return await this.membersRepository.find();
  }

  async findOne(id: number): Promise<Member | null> {
    return await this.membersRepository.findOneBy({ id });
  }

  async findByLogin(login: string): Promise<Member | null> {
    return await this.membersRepository.findOneBy({ login });
  }

  async update(id: number, updateMemberDto: UpdateMemberDto): Promise<Member> {
    return await this.membersRepository.save({ id, ...updateMemberDto });
  }

  async remove(id: number): Promise<void> {
    await this.membersRepository.delete(id);
  }
}
