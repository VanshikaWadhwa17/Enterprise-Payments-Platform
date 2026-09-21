package com.example.auth.dto;

import com.example.auth.model.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(@NotNull(message = "Role is required") Role role) {}
