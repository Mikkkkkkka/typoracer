import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLModule } from '@nestjs/graphql';
import {
  createComplexityRule,
  fieldExtensionsEstimator,
  simpleEstimator,
} from 'graphql-query-complexity';
import { DiscussionsModule } from './discussions/discussions.module';
import { GraphqlApiModule } from './graphql-api/graphql-api.module';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuotesModule } from './quotes/quotes.module';
import { UsersModule } from './users/users.module';
import { AttemptsModule } from './attempts/attempts.module';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(__dirname, 'schema.gql'),
      sortSchema: true,
      introspection: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
      validationRules: [
        createComplexityRule({
          maximumComplexity: 200,
          variables: {},
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        }),
      ],
    }),
    QuotesModule,
    DiscussionsModule,
    UsersModule,
    PagesModule,
    AttemptsModule,
    GraphqlApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
