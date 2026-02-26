#!/bin/sh

set -e

host="${DATABASE_HOST:-postgres}"
port="${DATABASE_PORT:-5432}"
user="${DB_USER:-prontuario}"
db="${DB_NAME:-prontuario}"

echo "Waiting for PostgreSQL to be ready..."

until PGPASSWORD="${DB_PASSWORD:-prontuario123}" pg_isready -h "$host" -p "$port" -U "$user" -d "$db"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing command"
exec "$@"
