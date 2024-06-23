import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { testOrmConfig } from 'src/configs/test.ormconfig';
import { Member } from 'src/members/entities/member.entity';
import { AuthService } from './auth.service';
import { MembersService } from 'src/members/members.service';
import * as request from 'supertest';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthController', () => {
  let app: INestApplication
  let repository: Repository<Member>;
  let jwtService: JwtService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useFactory: testOrmConfig, }),
        TypeOrmModule.forFeature([Member]),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            global: true,
            secret: configService.get<string>('TEST_JWT_SECRET'),
            signOptions: { expiresIn: '1d' },
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, MembersService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));
    jwtService = module.get<JwtService>(JwtService);
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

  it('/GET token (signin)', async () => {
    const signInDto: SignInDto = {
      login: 'test',
      password: 'test',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(signInDto);
    expect(response.status).toBe(200);
    expect(response.body.token).not.toBeNull();

    const payload = await jwtService.verify(response.body.token);
    expect(payload.sub).toBe(testMember.id);
  });

  it('/GET me (verify token)', async () => {
    const signInDto: SignInDto = {
      login: 'test',
      password: 'test',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(signInDto);
    const token = response.body.token;

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meResponse.status).toBe(200);
  });

});
