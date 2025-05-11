import jwt from "jsonwebtoken";

// Secret key used to sign and verify tokens.
// In a production environment, this should be stored in a secure environment variable.
const SECRET = "super-secret-key";

/**
 * Generates a signed JWT token from the provided payload.
 * @param payload - The data to include in the token (e.g., username, email)
 * @returns A JWT string valid for 1 hour
 */
export const generateToken = (payload: object): string => {
    return jwt.sign(payload, SECRET, {
        expiresIn: "1h" // Token will expire in one hour
    });
};

/**
 * Verifies and decodes a JWT token.
 * Throws an error if the token is invalid or expired.
 * @param token - The JWT token string
 * @returns The decoded payload
 */
export const verifyToken = (token: string): any => {
    return jwt.verify(token, SECRET);
};
