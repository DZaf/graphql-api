import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./schema"; // Your GraphQL schema and resolvers
import { verifyToken } from "./auth"; // JWT verification function

/**
 * Starts the Express server and configures Apollo GraphQL middleware.
 */
async function startServer() {
    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers,

        /**
         * Context function runs on every request.
         * It reads the Authorization header, verifies the JWT,
         * and injects the authenticated user into the context for resolvers to use.
         */
        context: ({ req }) => {
            const auth = req.headers.authorization || "";
            const token = auth.replace("Bearer ", "");

            try {
                const user = verifyToken(token); // Will throw if token is invalid or expired
                return { user }; // Makes user available as context.user in resolvers
            } catch {
                return { user: null }; // Unauthenticated request
            }
        }
    });

    await server.start();
    server.applyMiddleware({ app }); // Mount Apollo server as middleware on Express

    // Start Express HTTP server
    app.listen(4000, () =>
        console.log("Server running at http://localhost:4000/graphql")
    );
}

// Run the server
startServer();
