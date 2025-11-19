# App User Backend

Backend API for the app-user frontend application, built with Node.js and TypeScript.

## Features

- Express.js server
- TypeScript support
- CORS enabled
- OpenAI Agents integration
- SOLID principles architecture
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

## Architecture

This backend follows **SOLID principles**:

- **Single Responsibility**: Each service/class has one clear responsibility
  - `AgentConfigService`: Manages agent configuration
  - `WorkflowService`: Handles workflow execution
  - `ResponseFormatterService`: Formats API responses
  - `AskController`: Handles HTTP requests/responses

- **Open/Closed**: Easy to extend with new agent types without modifying existing code

- **Liskov Substitution**: Services implement interfaces that can be swapped

- **Interface Segregation**: Focused interfaces (`IWorkflowService`, `IAgentConfigService`)

- **Dependency Inversion**: High-level modules depend on abstractions (interfaces), not concrete implementations

## API Endpoints

### POST /ask

Ask a question to the AI assistant. The system will:
1. Classify the question into categories (sobre obras, sobre pavimentação, outros assuntos)
2. Route to the appropriate agent based on classification
3. Return the AI-generated response

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
  "data": "AI-generated response text",
  "userPrompt": "Your question",
  "dbData": "JSON string with metadata",
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
│   ├── controllers/      # Request handlers (HTTP layer)
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic services
│   │   ├── AgentConfigService.ts      # Agent configuration
│   │   ├── WorkflowService.ts         # Workflow execution
│   │   └── ResponseFormatterService.ts # Response formatting
│   ├── interfaces/       # TypeScript interfaces (abstractions)
│   │   ├── IWorkflowService.ts
│   │   └── IAgentConfigService.ts
│   ├── middleware/       # Custom middleware
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Main server file
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## OpenAI Agents Integration

The backend integrates with OpenAI Agents SDK:
- **Classification Agent**: Categorizes user questions
- **Obras Agent**: Handles questions about construction works
- **Pavimentação Agent**: Handles questions about pavement (uses file search tool)
- **Outros Assuntos Agent**: Handles other topics

The workflow automatically routes questions to the appropriate agent based on classification.

## Environment Variables

Create a `.env` file in the `app-user/backend` directory with the following content:

```
OPENAI_API_KEY=your-openai-api-key-here
PORT=3000
NODE_ENV=development
```

**Important**: The `.env` file is gitignored for security. Make sure to create it manually with your OpenAI API key. You can use `.env.example` as a template.

The `@openai/agents` library will automatically use the `OPENAI_API_KEY` environment variable.

