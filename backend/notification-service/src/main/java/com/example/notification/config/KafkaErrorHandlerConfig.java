package com.example.notification.config;

import io.micrometer.core.instrument.MeterRegistry;
import org.apache.kafka.common.TopicPartition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.ConsumerRecordRecoverer;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

/**
 * Bounded retry + dead-letter handling for this service's Kafka listener(s).
 *
 * <p>fraud-service, audit-service and notification-service all consume the
 * same source topic ("payment-events") under different consumer groups --
 * {@link DeadLetterPublishingRecoverer}'s default "&lt;topic&gt;.DLT" naming
 * would send all three services' failures to one shared topic,
 * indistinguishable from each other. The destination resolver below scopes
 * it per service instead: "payment-events.notification-service.DLT".
 *
 * <p>The log line and {@code kafka.consumer.errors} counter fire exactly
 * once per message, at the point retries are exhausted and the message is
 * being dead-lettered -- not once per individual attempt -- so the metric
 * means "a message failed for good", matching the KafkaConsumerFailure
 * alert's documented semantics.
 */
@Configuration
public class KafkaErrorHandlerConfig {

    private static final Logger log = LoggerFactory.getLogger(KafkaErrorHandlerConfig.class);
    private static final String SERVICE_NAME = "notification-service";

    @Bean
    public DefaultErrorHandler kafkaErrorHandler(KafkaTemplate<Object, Object> kafkaTemplate, MeterRegistry meterRegistry) {
        DeadLetterPublishingRecoverer deadLetterRecoverer = new DeadLetterPublishingRecoverer(
                kafkaTemplate,
                (record, ex) -> new TopicPartition(record.topic() + "." + SERVICE_NAME + ".DLT", record.partition()));

        ConsumerRecordRecoverer recoverer = (record, ex) -> {
            log.error(
                    "event=KafkaConsumerFailure topic={} partition={} offset={} exception={}",
                    record.topic(),
                    record.partition(),
                    record.offset(),
                    ex.toString(),
                    ex);
            meterRegistry
                    .counter("kafka.consumer.errors", "service", SERVICE_NAME, "topic", record.topic())
                    .increment();
            deadLetterRecoverer.accept(record, ex);
        };

        // 1 initial attempt + 2 retries, 1s apart, then dead-letter.
        return new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 2));
    }
}
