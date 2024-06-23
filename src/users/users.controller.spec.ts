import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import * as request from 'supertest';
import { testOrmConfig } from 'src/configs/test.ormconfig';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { plainToInstance } from 'class-transformer';

describe('UsersController', () => {
  let app: INestApplication
  let repository: Repository<User>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useFactory: testOrmConfig, }),
        TypeOrmModule.forFeature([User]),
      ],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await repository.clear();
  });

  let testUser: User;
  beforeEach(async () => {
    const createUserDto = plainToInstance(CreateUserDto, {
      id: 1,
      name: faker.internet.userName(),
      country: faker.location.country(),
    });
    testUser = await repository.save(createUserDto);
  });

  it('/Post users (create)', async () => {
    const createUserDto: CreateUserDto = {
      id: 101,
      name: faker.internet.userName(),
      country: faker.location.country(),
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('/GET users (findAll)', async () => {
    const response = await request(app.getHttpServer()).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/GET users/:id (findOne)', async () => {
    const response = await request(app.getHttpServer()).get(`/users/${testUser.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testUser.id);
  });

  it('/PATCH users/:id (update)', async () => {
    const newName = 'newName';

    const updateUserDto: UpdateUserDto = { name: newName };
    const response = await request(app.getHttpServer())
      .patch(`/users/${testUser.id}`)
      .send(updateUserDto);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(newName);
  });

});
