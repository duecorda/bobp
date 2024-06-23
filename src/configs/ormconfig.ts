import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { ConfigService } from "@nestjs/config";

export const ormConfig = async (): Promise<TypeOrmModuleOptions> => {
  const configService = new ConfigService();
  return {
    type: 'mysql',
    charset: 'utf8mb4',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    namingStrategy: new SnakeNamingStrategy(),
  };
};
