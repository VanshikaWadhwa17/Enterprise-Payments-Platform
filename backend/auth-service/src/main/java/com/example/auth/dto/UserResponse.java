package com.example.auth.dto;

import com.example.auth.model.AppUser;
import com.example.auth.model.Permission;
import com.example.auth.model.RolePermissions;
import com.example.auth.model.Role;
import java.util.List;
import java.util.UUID;

public record UserResponse(UUID id, String fullName, String email, Role role, List<Permission> permissions) {

    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                List.copyOf(RolePermissions.forRole(user.getRole())));
    }
}
