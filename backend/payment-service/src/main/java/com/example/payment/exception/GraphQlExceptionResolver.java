package com.example.payment.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class GraphQlExceptionResolver extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
        if (ex instanceof PaymentNotFoundException) {
            log.warn("event=GraphQlError type=NOT_FOUND field={} message={}", env.getField().getName(), ex.getMessage());
            return GraphqlErrorBuilder.newError(env)
                    .errorType(ErrorType.NOT_FOUND)
                    .message(ex.getMessage())
                    .build();
        }
        if (ex instanceof AccessDeniedException) {
            log.warn("event=GraphQlError type=FORBIDDEN field={}", env.getField().getName());
            return GraphqlErrorBuilder.newError(env)
                    .errorType(ErrorType.FORBIDDEN)
                    .message("You do not have permission to perform this operation")
                    .build();
        }
        if (ex instanceof AuthenticationException) {
            log.warn("event=GraphQlError type=UNAUTHORIZED field={}", env.getField().getName());
            return GraphqlErrorBuilder.newError(env)
                    .errorType(ErrorType.UNAUTHORIZED)
                    .message("Authentication is required")
                    .build();
        }
        log.error("event=GraphQlError type=INTERNAL field={} exception={}", env.getField().getName(), ex.toString(), ex);
        return null;
    }
}
