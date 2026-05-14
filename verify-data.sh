#!/bin/bash

echo "=== Verifying MongoDB Data ==="
docker exec mongodb mongosh myapp --eval "db.users.find().pretty()"

echo ""
echo "=== Verifying Redis Data ==="
docker exec redis redis-cli KEYS "*"

echo ""
echo "=== Redis Cache Content ==="
docker exec redis redis-cli GET "users"

echo ""
echo "=== Docker Volumes ==="
docker volume ls | grep -E "mongodb|redis"

echo ""
echo "=== Volume Details ==="
docker volume inspect mongodb_data --format '{{ .Mountpoint }}'
docker volume inspect redis_data --format '{{ .Mountpoint }}'
