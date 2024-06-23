import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testOrmConfig } from 'src/configs/test.ormconfig';
import { faker } from '@faker-js/faker';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

describe('UsersService', () => {
  let service: UsersService;
  let module: TestingModule;
  let testUser: User;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useFactory: testOrmConfig, }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);

    testUser = await service.create({
      id: 1,
      name: 'test',
      email: 'test@test.com',
    });
  });

  afterEach(async () => {
    await module.close();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      id: 101,
      name: faker.internet.userName(),
      country: faker.location.country(),
    };
    const user = await service.create(createUserDto);
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBeDefined();
    expect(user.name).toBeDefined();
  });

  it('should return an array of users', async () => {
    const user = await service.create({
      id: 101,
      name: 'test',
      email: 'test@test.com',
    });

    const res = await service.findAll();
    expect(res.users).toBeInstanceOf(Array);
    expect(res.users.length).toBeGreaterThanOrEqual(0);
    expect(res.users.some(user => user.id === testUser.id)).toBe(true);

    // range, sort, filter 테스트 필요
  });

  it('should find a user by id', async () => {
    const foundUser = await service.findOne(testUser.id);
    expect(foundUser).toEqual(testUser);
  });

  it('should update a user', async () => {
    const newName = 'newName';
    const updatedUser = await service.update(testUser.id, { name: newName });
    expect(updatedUser).toBeDefined();
    expect(updatedUser.name).toBe(newName);
  });

  it('should remove a user', async () => {
    const result = await service.remove(testUser.id);
    expect(result).toBeUndefined();

    const deletedUser = await service.findOne(testUser.id);
    expect(deletedUser).toBeNull();
  });



});
