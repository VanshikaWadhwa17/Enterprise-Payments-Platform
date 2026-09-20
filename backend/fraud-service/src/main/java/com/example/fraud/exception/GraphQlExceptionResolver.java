package com.example.fraud.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

@Component
public class GraphQlExceptionResolver extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
        if (ex instanceof FraudCaseNotFoundException) {
            return GraphqlErrorBuilder.newError(env)
                    .errorType(ErrorType.NOT_FOUND)
                    .message(ex.getMessage())
                    .build();
        }
        if (ex instanceof AccessDeniedException) {
            return GraphqlErrorBuilder.newError(env)
                    .errorType(ErrorType.FORBIDDEN)
                    .message("You do not have permission to perform this operation")
                    .build();
        }
        if (ex instanceof AuthenticationException) {
            return GraphqlErrorBuilder.newError(env)
                    .errorType(ErrorType.UNAUTHORIZED)
                    .message("Authentication is required")
                    .build();
        }
        return null;
    }
}
