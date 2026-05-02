import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './auth/auth.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { GraphQLModule } from '@nestjs/graphql';
import type { Request } from 'express';
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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }: { req: Request }) => ({ req }),
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
  providers: [],
})
export class AppModule {}
