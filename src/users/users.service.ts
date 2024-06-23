import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
/* Entities */
import { User } from 'src/users/entities/user.entity';
/* DTOs */
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ListQueryParamsDto } from 'src/users/dto/list-query-params.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async createFromCsv(userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async findAll(listQueryParams: ListQueryParamsDto = {}): Promise<{ users: User[], contentRange: string }> {
    const { range, sort, filter } = listQueryParams;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        queryBuilder.andWhere(`user.${key} LIKE :${key}`, { [key]: `%${value}%` });
      });
    }

    if (range) {
      queryBuilder.skip(range.start).take(range.end - range.start + 1);
    }

    if (sort) {
      queryBuilder.orderBy(sort.field, sort.order);
    }

    const result = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

    const users = instanceToPlain(result) as User[];
    const contentRange = `users ${range?.start}-${range?.end}/${totalCount}`;

    return { users, contentRange }
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id });
  }

  async findByIds(ids: number[]): Promise<User[]> {
    return await this.usersRepository.findBy({
      id: In(ids)
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async deleteAll(): Promise<void> {
    await this.usersRepository.delete({});
  }
}
