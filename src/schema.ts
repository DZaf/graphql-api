// Import GraphQL tools
import { gql } from "apollo-server-express";

// Custom auth token generator
import { generateToken } from "./auth";

// Type definitions for users and jobs
import { User, Job } from "./types";

// File system and path utilities for reading/writing data
import fs from "fs";
import path from "path";

// For password hashing
import bcrypt from "bcryptjs";

// Path to your local JSON "database"
const dataPath = path.join(__dirname, "data.json");

const ensureDataFile = () => {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // Create directory if it doesn't exist
    }

    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, "[]"); // Initialize with empty array if file doesn't exist
    }
};

// Load users from local JSON file
const loadData = (): User[] => {
    ensureDataFile();
    return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
};

// Save users to local JSON file
const saveData = (data: User[]) => {
    ensureDataFile();
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// GraphQL schema definition
export const typeDefs = gql`
  # Represents a job assigned to a user
  type Job {
    title: String!
    description: String!
    endDate: String!
  }

  # Represents a user with jobs
  type User {
    name: String!
    surname: String!
    username: String!
    email: String!
    password: String!
    jobs: [Job!]!
  }

  # Inputs for creating or updating a job
  input JobInput {
    title: String!
    description: String!
    endDate: String!
  }

  # Inputs for creating a new user
  input UserInput {
    name: String!
    surname: String!
    username: String!
    email: String!
    password: String!
  }

  # Response for login/register/job mutations
  type AuthPayload {
    user: User
    message: String
    error: String
    token: String
  }

  type Query {
    users: [User!]!
    user(username: String!): User
  }

  type Mutation {
    addUser(input: UserInput!): User
    addJob(username: String!, job: JobInput!): User

    register(input: UserInput!): AuthPayload
    login(identifier: String!, password: String!): AuthPayload

    # These mutations now require the token for access (user inferred from token)
    createJob(job: JobInput!): AuthPayload
    updateJob(title: String!, job: JobInput!): AuthPayload
    deleteJob(title: String!): AuthPayload
  }
`;

// Resolvers implement logic behind schema fields
export const resolvers = {
    Query: {
        // Return all users (public query)
        users: () => loadData(),

        // Return a single user by username
        user: (_: any, { username }: { username: string }) =>
            loadData().find(u => u.username === username),
    },

    Mutation: {
        // Manually adds a user (not secure, mostly for testing)
        addUser: (_: any, { input }: { input: User }) => {
            const users = loadData();
            const existing = users.find(u => u.username === input.username);
            if (existing) throw new Error("User already exists");

            const newUser = { ...input, jobs: [] };
            users.push(newUser);
            saveData(users);
            return newUser;
        },

        // Manually adds a job using a passed username (not protected)
        addJob: (_: any, { username, job }: { username: string; job: any }) => {
            const users = loadData();
            const user = users.find(u => u.username === username);
            if (!user) throw new Error("User not found");

            user.jobs.push(job);
            saveData(users);
            return user;
        },

        // User registration with password hashing
        register: async (_: any, { input }: { input: User }) => {
            const users = loadData();
            const exists = users.find(
                u => u.username === input.username || u.email === input.email
            );
            if (exists) {
                return { user: null, error: "User already exists" };
            }

            const hashedPassword = await bcrypt.hash(input.password, 10);
            const newUser = { ...input, password: hashedPassword, jobs: [] };
            users.push(newUser);
            saveData(users);

            return { user: newUser, message: "Registration successful" };
        },

        // User login, verifies password and returns JWT
        login: async (_: any, args: { identifier: string; password: string }) => {
            const { identifier, password } = args;
            const users = loadData();
            const user = users.find(u => u.username === identifier || u.email === identifier);
            if (!user) return { user: null, error: "User not found" };

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return { user: null, error: "Invalid password" };

            const token = generateToken({ username: user.username, email: user.email });

            return {
                user,
                message: "Login successful",
                token
            };
        },

        // Secure job creation — user is extracted from the token (context.user)
        createJob: (_: any, { job }: { job: Job }, context: any) => {
            const currentUser = context.user;
            if (!currentUser) return { user: null, error: "Unauthorized" };

            const users = loadData();
            const user = users.find(u => u.username === currentUser.username);
            if (!user) return { user: null, error: "User not found" };

            user.jobs.push(job);
            saveData(users);
            return { user, message: "Job added successfully" };
        },

        // Secure job update using the job title as identifier
        updateJob: (_: any, { title, job }: { title: string; job: Job }, context: any) => {
            const currentUser = context.user;
            if (!currentUser) return { user: null, error: "Unauthorized" };

            const users = loadData();
            const user = users.find(u => u.username === currentUser.username);
            if (!user) return { user: null, error: "User not found" };

            const jobIndex = user.jobs.findIndex(j => j.title === title);
            if (jobIndex === -1) return { user: null, error: "Job not found" };

            user.jobs[jobIndex] = job;
            saveData(users);
            return { user, message: "Job updated successfully" };
        },

        // Secure job deletion
        deleteJob: (_: any, { title }: { title: string }, context: any) => {
            const currentUser = context.user;
            if (!currentUser) return { user: null, error: "Unauthorized" };

            const users = loadData();
            const user = users.find(u => u.username === currentUser.username);
            if (!user) return { user: null, error: "User not found" };

            const jobIndex = user.jobs.findIndex(j => j.title === title);
            if (jobIndex === -1) return { user: null, error: "Job not found" };

            user.jobs.splice(jobIndex, 1);
            saveData(users);
            return { user, message: "Job deleted successfully" };
        },
    }
};
