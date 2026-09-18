#!/bin/sh
# Runs once, on first initialization of an empty Postgres data directory.
# Creates one database + matching role per service, alongside the default
# database created by POSTGRES_DB/POSTGRES_USER. Each service owns its own
# database -- this just runs multiple owners against one shared Postgres
# instance instead of spinning up five separate containers.
set -e

create_service_db() {
  db_name="$1"
  role_name="$2"
  role_password="$3"

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
    DO \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${role_name}') THEN
        CREATE ROLE ${role_name} LOGIN PASSWORD '${role_password}';
      END IF;
    END
    \$\$;

    SELECT 'CREATE DATABASE ${db_name} OWNER ${role_name}'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db_name}')\gexec
SQL
}

create_service_db "accounts" "accounts" "accounts"
create_service_db "fraud" "fraud" "fraud"
create_service_db "reconciliation" "reconciliation" "reconciliation"
create_service_db "audit" "audit" "audit"
