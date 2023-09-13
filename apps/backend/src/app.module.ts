import { Module } from '@nestjs/common';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { HeaderResolver } from 'nestjs-i18n';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from './config/config.type';
import { AgendaModule } from 'agenda-nest';
import { AgendaModuleConfig } from 'agenda-nest/dist/interfaces';

import { PactsModule } from './pacts/pacts.module';
import { PrizesModule } from './prizes/prizes.module';
import { UsersModule } from './users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { JobsModule } from './jobs/jobs.module';
import mailConfig from './config/mail.config';
import { EthersModule } from 'nestjs-ethers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, mailConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    AgendaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) =>
        ({
          db: {
            address: config.get<string>('SCHEDULE_DATABASE_URL'),
          },
        }) as AgendaModuleConfig,
      inject: [ConfigService],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),

    PactsModule,
    PrizesModule,
    UsersModule,
    MailModule,
    MailerModule,
    JobsModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
