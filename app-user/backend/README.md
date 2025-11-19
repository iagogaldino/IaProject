# App User Backend

Backend API for the app-user frontend application, built with Node.js and TypeScript.

## Features

- Express.js server
- TypeScript support
- CORS enabled
- Mock endpoints for development
- RESTful API structure

## Installation

```bash
npm install
```

## Development

Run the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Build

Build the TypeScript code:

```bash
npm run build
```

## Production

Run the production server:

```bash
npm start
```

## API Endpoints

### POST /ask

Ask a question to the AI assistant (currently returns mock responses).

**Request Body:**
```json
{
  "prompt": "Your question here",
  "userId": "optional-user-id",
  "sessionId": "optional-session-id",
  "conversationHistory": [],
  "metadata": {}
}
```

**Response:**
```json
{
  "data": "Response text",
  "userPrompt": "Your question",
  "dbData": "Database data",
  "promtptToSend": "Processed prompt"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/         # Route definitions
│   ├── middleware/     # Custom middleware
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # Main server file
├── dist/               # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
PORT=3000
NODE_ENV=development
```

