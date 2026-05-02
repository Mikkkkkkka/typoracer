import { ApolloServerPlugin, BaseContext } from '@apollo/server';
import type { GraphQLRequestContextDidResolveOperation } from '@apollo/server';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

export function createComplexityPlugin(
  maximumComplexity: number,
): ApolloServerPlugin<BaseContext> {
  return {
    requestDidStart() {
      return Promise.resolve({
        didResolveOperation(
          requestContext: GraphQLRequestContextDidResolveOperation<BaseContext>,
        ) {
          if (!requestContext.document) {
            return Promise.resolve();
          }

          const complexity = getComplexity({
            schema: requestContext.schema,
            query: requestContext.document,
            operationName: requestContext.request.operationName ?? undefined,
            variables: requestContext.request.variables as Record<
              string,
              unknown
            >,
            estimators: [
              fieldExtensionsEstimator(),
              simpleEstimator({ defaultComplexity: 1 }),
            ],
          });

          if (complexity > maximumComplexity) {
            throw new GraphQLError(
              `Query is too complex: ${complexity}. Maximum allowed complexity: ${maximumComplexity}.`,
            );
          }

          return Promise.resolve();
        },
      });
    },
  };
}
