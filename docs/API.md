# TeamFlow PM API Documentation

Base URL: `http://localhost:3000/api` (development) or your production backend URL.

All API responses return JSON. Successful responses have HTTP status 2xx, errors return appropriate 4xx/5xx status codes with error details.

## Authentication

Most endpoints require authentication via JWT Bearer token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Health Check

### GET /api/health

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "subscription_tier": "free"
  },
  "token": "jwt_token_here"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### POST /api/auth/login

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "subscription_tier": "free"
  },
  "token": "jwt_token_here"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Workspace Management

### GET /api/workspaces

Get all workspaces the current user is a member of.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "workspace_uuid",
    "name": "Marketing Team",
    "description": "Marketing campaigns and content",
    "created_by": "user_uuid",
    "role": "admin",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer your_jwt_token"
```

### POST /api/workspaces

Create a new workspace.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Engineering Team",
  "description": "Software development projects"
}
```

**Response (201 Created):**
```json
{
  "id": "workspace_uuid",
  "name": "Engineering Team",
  "description": "Software development projects",
  "created_by": "user_uuid",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Engineering Team","description":"Software development projects"}'
```

## Task Board Management

### GET /api/workspaces/:workspaceId/boards

Get all boards in a workspace.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `workspaceId` (string, required): UUID of the workspace

**Response (200 OK):**
```json
[
  {
    "id": "board_uuid",
    "workspace_id": "workspace_uuid",
    "name": "Q1 Product Launch",
    "description": "Tasks for Q1 product launch",
    "position": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/workspaces/workspace_uuid/boards \
  -H "Authorization: Bearer your_jwt_token"
```

### POST /api/workspaces/:workspaceId/boards

Create a new board in a workspace. Requires admin role.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `workspaceId` (string, required): UUID of the workspace

**Request Body:**
```json
{
  "name": "Bug Fixes",
  "description": "Critical bug fixes for this week"
}
```

**Response (201 Created):**
```json
{
  "id": "board_uuid",
  "workspace_id": "workspace_uuid",
  "name": "Bug Fixes",
  "description": "Critical bug fixes for this week",
  "position": 2,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/workspaces/workspace_uuid/boards \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bug Fixes","description":"Critical bug fixes for this week"}'
```

## Task Management

### GET /api/boards/:boardId/tasks

Get all tasks in a board.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `boardId` (string, required): UUID of the board

**Response (200 OK):**
```json
[
  {
    "id": "task_uuid",
    "board_id": "board_uuid",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication system",
    "column": "in_progress",
    "position": 1,
    "assignee_id": "user_uuid",
    "assignee_name": "John Doe",
    "assignee_email": "john@example.com",
    "created_by": "user_uuid",
    "due_date": "2024-01-20T10:30:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/boards/board_uuid/tasks \
  -H "Authorization: Bearer your_jwt_token"
```

### POST /api/boards/:boardId/tasks

Create a new task in a board.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `boardId` (string, required): UUID of the board

**Request Body:**
```json
{
  "title": "Design dashboard UI",
  "description": "Create mockups for the new dashboard",
  "column": "todo",
  "assignee_id": "user_uuid"
}
```

**Response (201 Created):**
```json
{
  "id": "task_uuid",
  "board_id": "board_uuid",
  "title": "Design dashboard UI",
  "description": "Create mockups for the new dashboard",
  "column": "todo",
  "position": 1,
  "assignee_id": "user_uuid",
  "created_by": "user_uuid",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/boards/board_uuid/tasks \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"title":"Design dashboard UI","description":"Create mockups","column":"todo"}'
```

### PATCH /api/tasks/:taskId

Update a task (e.g., move between columns, change assignee).

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `taskId` (string, required): UUID of the task

**Request Body (partial updates allowed):**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "column": "done",
  "assignee_id": "new_user_uuid",
  "position": 3
}
```

**Response (200 OK):**
```json
{
  "id": "task_uuid",
  "board_id": "board_uuid",
  "title": "Updated task title",
  "description": "Updated description",
  "column": "done",
  "position": 3,
  "assignee_id": "new_user_uuid",
  "created_by": "user_uuid",
  "updated_at": "2024-01-15T11:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/tasks/task_uuid \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"column":"done","position":3}'
```

## Stripe Payment Integration

### POST /api/stripe/create-checkout-session

Create a Stripe Checkout session for upgrading to Pro tier.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "sessionId": "cs_test_xxxxxxxxxxxxxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Authorization: Bearer your_jwt_token"
```

### POST /api/stripe/webhook

Stripe webhook endpoint for processing payment events. Used internally by Stripe.

**Headers:**
```
Stripe-Signature: stripe_signature_here
```

**Request Body:** Raw JSON from Stripe

**Response (200 OK):**
```json
{
  "received": true
}
```

## Email Endpoints (Optional)

### POST /api/auth/forgot-password

Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account exists, you will receive a reset email"
}
```

### POST /api/auth/reset-password

Reset password using a valid reset token.

**Request Body:**
```json
{
  "token": "reset_jwt_token",
  "password": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successful"
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "errors": [
    {
      "msg": "Invalid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "No access to this workspace"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- Authentication endpoints: 10 requests per 15 minutes per IP
- All other API endpoints: 100 requests per 15 minutes per IP

Exceeded rate limits return HTTP 429 with:
```json
{
  "error": "Too many requests, please try again later"
}
```

## WebSocket Events (Future)

Real-time updates are planned for future releases:
- Task updates
- New comments
- User presence
- Live notifications

## Versioning

Current API version: v1

All endpoints are under `/api/` prefix. Future versions will use `/api/v2/` etc.

## Support

For API issues or questions:
1. Check the health endpoint: `GET /api/health`
2. Verify authentication token is valid
3. Check request/response formats match documentation
4. Review server logs for detailed error information