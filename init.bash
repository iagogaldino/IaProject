docker run -d \
  --name pg \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=app_db \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16