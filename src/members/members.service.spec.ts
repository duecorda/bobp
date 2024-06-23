import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { faker } from '@faker-js/faker';
import { testOrmConfig } from 'src/configs/test.ormconfig';
import { Member } from 'src/members/entities/member.entity';
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
import { MembersService } from 'src/members/members.service';

describe('MembersService', () => {
  let service: MembersService;
  let module: TestingModule;
  let testMember: Member;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useFactory: testOrmConfig, }),
        TypeOrmModule.forFeature([Member]),
      ],
      providers: [MembersService],
    }).compile();

    service = module.get<MembersService>(MembersService);

    testMember = await service.create({
      login: 'test',
      password: 'test',
    });
  });

  afterEach(async () => {
    await module.close();
  });

  it('should create a member', async () => {
    const member = await service.create({
      login: faker.internet.userName(),
      password: faker.internet.password(),
    });
    expect(member).toBeInstanceOf(Member);
    expect(member.id).toBeDefined();
    expect(member.login).toBeDefined();
    expect(member.password).toBeDefined();
  });

  it('should return an array of members', async () => {
    const member = await service.create({
      login: faker.internet.userName(),
      password: faker.internet.password(),
    });

    const members = await service.findAll();
    expect(members).toBeInstanceOf(Array);
    expect(members.length).toBeGreaterThanOrEqual(0);
    expect(members).toContainEqual(testMember);
    expect(members).toContainEqual(member);
  });

  it('should find a member by login', async () => {
    const foundMember = await service.findByLogin('test');
    expect(foundMember).toEqual(testMember);
  });

  it('should find a member by id', async () => {
    const foundMember = await service.findOne(testMember.id);
    expect(foundMember).toEqual(testMember);
  });

  it('should update a member', async () => {
    const updatedMember = await service.update(testMember.id, { login: 'updatedLoginId' });
    expect(updatedMember).toBeDefined();
    expect(updatedMember.login).toBe('updatedLoginId');
  });

  it('should remove a member', async () => {
    const result = await service.remove(testMember.id);
    expect(result).toBeUndefined();

    const deletedMember = await service.findOne(testMember.id);
    expect(deletedMember).toBeNull();
  });

  it('should encrypt the password only through dto', async () => {
    const pw = faker.internet.password();
    const member = await service.create({
      login: faker.internet.userName(),
      password: pw,
    });
    expect(member.password).toEqual(pw);

    const plainTextPassword = 'plainTextPassword';
    const createMemberDto = plainToInstance(CreateMemberDto, {
      login: 'tester',
      password: plainTextPassword,
    });
    const tester = await service.create(createMemberDto);
    expect(tester.password).not.toEqual(plainTextPassword);
  });

});
