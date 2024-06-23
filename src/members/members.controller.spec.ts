import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { faker } from '@faker-js/faker';
import * as request from 'supertest';
import { testOrmConfig } from 'src/configs/test.ormconfig';
import { Member } from 'src/members/entities/member.entity';
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
import { UpdateMemberDto } from 'src/members/dto/update-member.dto';
import { MembersController } from 'src/members/members.controller';
import { MembersService } from 'src/members/members.service';

describe('MembersController', () => {
  let app: INestApplication
  let repository: Repository<Member>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useFactory: testOrmConfig, }),
        TypeOrmModule.forFeature([Member]),
      ],
      controllers: [MembersController],
      providers: [MembersService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await repository.clear();
  });

  let testMember: Member;
  beforeEach(async () => {
    const createMemberDto = plainToInstance(CreateMemberDto, {
      login: 'test',
      password: 'test',
    });
    testMember = await repository.save(createMemberDto);
  });

  it('/Post members (create)', async () => {
    const createMemberDto: CreateMemberDto = {
      login: faker.internet.userName(),
      password: faker.internet.password(),
    };

    const response = await request(app.getHttpServer())
      .post('/members')
      .send(createMemberDto);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('/GET members (findAll)', async () => {
    const response = await request(app.getHttpServer()).get('/members');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/GET members/:id (findOne)', async () => {
    const response = await request(app.getHttpServer()).get(`/members/${testMember.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testMember.id);
    expect(response.body.login).toBe(testMember.login);
  });

  it('/PATCH members/:id (update)', async () => {
    const oldPassword = testMember.password;

    const updateMemberDto: UpdateMemberDto = { password: 'newPassword' };
    const response = await request(app.getHttpServer())
      .patch(`/members/${testMember.id}`)
      .send(updateMemberDto);
    expect(response.status).toBe(200);

    const updatedMember = await repository.findOne({ where: { id: testMember.id } });
    expect(updatedMember?.password).not.toBe(oldPassword);
  });

  it('/DELETE members/:id (remove)', async () => {
    const response = await request(app.getHttpServer()).delete(`/members/${testMember.id}`);
    expect(response.status).toBe(200);

    const deletedMember = await repository.findOne({ where: { id: testMember.id } });
    expect(deletedMember).toBeNull();
  });

});
