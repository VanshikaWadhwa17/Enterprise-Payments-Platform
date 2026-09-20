package com.example.payment.config;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Static role -&gt; permission mapping. Mirrors the ROLE_PERMISSIONS map in
 * libs/auth/src/lib/permissions/permissions.ts (and auth-service's own copy)
 * -- kept in sync by hand, not shared code, since this is a separate
 * language/service boundary.
 */
public final class RolePermissions {

    private static final Map<Role, Set<Permission>> ROLE_PERMISSIONS = new EnumMap<>(Role.class);

    static {
        ROLE_PERMISSIONS.put(Role.ADMIN, EnumSet.allOf(Permission.class));
        ROLE_PERMISSIONS.put(
                Role.PAYMENT_ANALYST,
                EnumSet.of(
                        Permission.PAYMENT_VIEW,
                        Permission.PAYMENT_CREATE,
                        Permission.RECONCILIATION_VIEW,
                        Permission.REPORT_VIEW));
        ROLE_PERMISSIONS.put(
                Role.OPERATIONS_MANAGER,
                EnumSet.of(
                        Permission.PAYMENT_VIEW,
                        Permission.PAYMENT_APPROVE,
                        Permission.PAYMENT_CANCEL,
                        Permission.RECONCILIATION_VIEW,
                        Permission.RECONCILIATION_RESOLVE,
                        Permission.REPORT_VIEW));
        ROLE_PERMISSIONS.put(
                Role.FRAUD_ANALYST,
                EnumSet.of(
                        Permission.FRAUD_VIEW,
                        Permission.FRAUD_REVIEW,
                        Permission.FRAUD_BLOCK,
                        Permission.PAYMENT_VIEW,
                        Permission.REPORT_VIEW));
        ROLE_PERMISSIONS.put(
                Role.VIEWER,
                EnumSet.of(
                        Permission.PAYMENT_VIEW,
                        Permission.FRAUD_VIEW,
                        Permission.RECONCILIATION_VIEW,
                        Permission.REPORT_VIEW));
    }

    private RolePermissions() {}

    public static Set<Permission> forRole(Role role) {
        return ROLE_PERMISSIONS.getOrDefault(role, Set.of());
    }
}
