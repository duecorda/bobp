import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from '@nestjs/testing';

export const testOrmConfig = async (): Promise<TypeOrmModuleOptions> => {
  const module = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ envFilePath: '.env.test' })],
    providers: []
  }).compile();
  const configService = module.get<ConfigService>(ConfigService);
  return {
    type: 'mysql',
    charset: 'utf8mb4',
    host: configService.get<string>('TEST_DB_HOST'),
    port: configService.get<number>('TEST_DB_PORT'),
    username: configService.get<string>('TEST_DB_USERNAME'),
    password: configService.get<string>('TEST_DB_PASSWORD'),
    database: configService.get<string>('TEST_DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    dropSchema: true,
    namingStrategy: new SnakeNamingStrategy(),
  };
};