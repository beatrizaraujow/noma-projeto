# NexORA API Documentation

## Base URL

```
Development: http://localhost:3001/api
Production: https://api.nexora.dev
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** Same as register

---

### Users

#### GET /users/me
Get current user profile.

**Headers:** Authorization required

**Response:**
```json
{
  "id": "cuid123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2026-01-13T10:00:00.000Z",
  "updatedAt": "2026-01-13T10:00:00.000Z"
}
```

#### GET /users
Get all users.

**Headers:** Authorization required

**Response:**
```json
[
  {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
]
```

---

### Projects

#### POST /projects
Create a new project.

**Headers:** Authorization required

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description",
  "color": "#3B82F6",
  "icon": "🚀"
}
```

**Response:**
```json
{
  "id": "project123",
  "name": "My Project",
  "description": "Project description",
  "color": "#3B82F6",
  "icon": "🚀",
  "ownerId": "cuid123",
  "owner": {
    "id": "cuid123",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "createdAt": "2026-01-13T10:00:00.000Z",
  "updatedAt": "2026-01-13T10:00:00.000Z"
}
```

#### GET /projects
Get all projects for current user.

**Headers:** Authorization required

**Response:**
```json
[
  {
    "id": "project123",
    "name": "My Project",
    "description": "Project description",
    "owner": {
      "id": "cuid123",
      "name": "John Doe"
    },
    "_count": {
      "tasks": 5,
      "members": 3
    }
  }
]
```

#### GET /projects/:id
Get project by ID.

**Headers:** Authorization required

**Response:**
```json
{
  "id": "project123",
  "name": "My Project",
  "description": "Project description",
  "owner": { ... },
  "members": [ ... ],
  "tasks": [ ... ]
}
```

#### PATCH /projects/:id
Update project.

**Headers:** Authorization required

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

#### DELETE /projects/:id
Delete project.

**Headers:** Authorization required

**Response:** 204 No Content

---

### Tasks

#### POST /tasks
Create a new task.

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "My Task",
  "description": "Task description",
  "projectId": "project123",
  "assigneeId": "cuid123",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2026-01-20T00:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "task123",
  "title": "My Task",
  "description": "Task description",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-01-20T00:00:00.000Z",
  "projectId": "project123",
  "assigneeId": "cuid123",
  "project": { ... },
  "assignee": { ... },
  "createdAt": "2026-01-13T10:00:00.000Z",
  "updatedAt": "2026-01-13T10:00:00.000Z"
}
```

#### GET /tasks
Get all tasks, optionally filtered by project.

**Headers:** Authorization required

**Query Parameters:**
- `projectId` (optional): Filter by project

**Response:**
```json
[
  {
    "id": "task123",
    "title": "My Task",
    "status": "TODO",
    "priority": "HIGH",
    "project": { ... },
    "assignee": { ... }
  }
]
```

#### GET /tasks/:id
Get task by ID.

**Headers:** Authorization required

#### PATCH /tasks/:id
Update task.

**Headers:** Authorization required

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "priority": "URGENT"
}
```

#### DELETE /tasks/:id
Delete task.

**Headers:** Authorization required

---

## WebSocket Events

Connect to: `ws://localhost:3001`

### Client → Server

#### join_project
Join a project room for real-time updates.

```json
{
  "projectId": "project123"
}
```

#### leave_project
Leave a project room.

```json
{
  "projectId": "project123"
}
```

#### task_update
Broadcast task update to project members.

```json
{
  "projectId": "project123",
  "task": { ... }
}
```

#### typing
Notify others of typing activity.

```json
{
  "projectId": "project123",
  "user": "John Doe"
}
```

### Server → Client

#### task_created
New task created in project.

```json
{
  "id": "task123",
  "title": "New Task",
  ...
}
```

#### task_updated
Task updated in project.

```json
{
  "id": "task123",
  "status": "DONE",
  ...
}
```

#### task_deleted
Task deleted from project.

```json
{
  "taskId": "task123"
}
```

#### user_typing
User is typing.

```json
{
  "projectId": "project123",
  "user": "John Doe"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` OK
- `201` Created
- `204` No Content
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `422` Unprocessable Entity
- `500` Internal Server Error

---

## Rate Limiting

- **Rate:** 10 requests per minute per IP
- **Header:** `X-RateLimit-Remaining`

Exceeded rate limit returns `429 Too Many Requests`

---

## Swagger Documentation

Interactive API documentation available at:

```
http://localhost:3001/api/docs
```

---

## GraphQL API

GraphQL endpoint available at:

```
http://localhost:3001/graphql
```

GraphQL Playground:
```
http://localhost:3001/graphql
```

### Example Query

```graphql
query {
  users {
    id
    name
    email
  }
}
```

### Example Mutation

```graphql
mutation {
  createTask(input: {
    title: "New Task"
    projectId: "project123"
  }) {
    id
    title
  }
}
```
