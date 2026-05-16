import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './auth/auth.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { GraphQLModule } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { EtagInterceptor } from './common/interceptors/etag.interceptor';
import { RequestTimingInterceptor } from './common/interceptors/request-timing.interceptor';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuotesModule } from './quotes/quotes.module';
import { UsersModule } from './users/users.module';
import { AttemptsModule } from './attempts/attempts.module';
import { createComplexityPlugin } from './graphql/graphql-complexity.plugin';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 5,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      plugins: [createComplexityPlugin(200)],
    }),
    AuthModule,
    QuotesModule,
    DiscussionsModule,
    UsersModule,
    AttemptsModule,
    PagesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTimingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EtagInterceptor,
    },
  ],
})
export class AppModule {}
