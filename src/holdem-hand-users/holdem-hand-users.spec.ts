import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { faker } from '@faker-js/faker';
import { testOrmConfig } from 'src/configs/test.ormconfig';

import { User } from 'src/users/entities/user.entity';
import { HoldemTable } from 'src/games/entities/holdem-table.entity';
import { HoldemHand } from 'src/games/entities/holdem-hand.entity';

import { UsersService } from 'src/users/users.service';
import { GamesService } from 'src/games/games.service';

import { HoldemHandUsersService } from './holdem-hand-users.service';
import { HoldemHandUser } from './entities/holdem-hand-user.entity';

describe('HoldemHandUsersService', () => {
  let service: HoldemHandUsersService;
  let usersService: UsersService;
  let gamesService: GamesService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useFactory: testOrmConfig, }),
        TypeOrmModule.forFeature([
          HoldemHandUser, User, HoldemTable, HoldemHand,
        ]),
      ],
      providers: [HoldemHandUsersService],
    }).compile();

    service = module.get<HoldemHandUsersService>(HoldemHandUsersService);
    usersService = module.get<UsersService>(UsersService);
    gamesService = module.get<GamesService>(GamesService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should create a holdem-hand-user', async () => {
    const user = await usersService.create({
      id: 123,
      name: faker.internet.userName(),
      country: faker.location.country(),
    });
    expect(user).toBeInstanceOf(User);

    // Create a holdem-table
    // Create a holdem-hand
    // Create a holdem-hand-user
  });

});