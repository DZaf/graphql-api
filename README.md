# Simple GraphQL + Node.js + TypeScript API

This is a minimal GraphQL API built with Node.js, Express, Apollo Server, and TypeScript.  
It stores data in a local JSON file (`data.json`) and supports authentication using JWT tokens.

---

## Features

- Register and login with hashed passwords
- Issue and verify JWT tokens
- Authenticated CRUD operations on user-linked jobs
- All data persisted to `data.json` locally
- Clean GraphQL schema and resolver structure

---

## Tech Stack

- Node.js + TypeScript
- Express + Apollo Server (GraphQL)
- `bcryptjs` for password hashing
- `jsonwebtoken` for authentication
- Local file-based persistence (`fs`)

---

## Project Structure

```
.
├── src/
│   ├── index.ts         # Entry point with Apollo + Express
│   ├── schema.ts        # GraphQL schema and resolvers
│   ├── auth.ts          # Token generation and verification
│   ├── types.ts         # TypeScript types (User, Job)
│   ├── data.json        # Local JSON data store
│   └── examples.graphql # Sample operations for testing
├── package.json
├── tsconfig.json
└── README.md
```

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Run the project in development mode

```bash
npm run dev
```

### 3. Open GraphQL API in your browser

```
http://localhost:4000/graphql
```

---

## Authentication

Login or register returns a `token`. Use it in requests as:

```http
Authorization: Bearer <your-token-here>
```

Set this in Apollo Sandbox or your frontend headers.

---

## Example GraphQL Usage

See `src/examples.graphql` for full usage:

- Register 2 users
- Login
- Create, update, delete jobs
- Query users and jobs

---

## Testing

You can use:
- [Apollo Sandbox](https://studio.apollographql.com/sandbox/explorer)
- Postman (GraphQL tab)
- VS Code GraphQL extensions

---

## License

MIT License
