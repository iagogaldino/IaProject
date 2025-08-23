docker build -t backend-dev-0.0.1 .

docker run -p 3000:3000 -v cd:/app --env-file .env --network minha-rede iaproject-dev-0.0.1

docker compose up
