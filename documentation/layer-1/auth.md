# Auth Middleware Documentation

The `auth.js` file is a middleware function that handles JWT token authentication for protected routes. It validates the Authorization header, extracts and verifies JWT tokens, and attaches decoded user information to the request object.

## Functions

### auth (default export)

**Function Overview**
- Intercepts HTTP requests to protected routes
- Extracts JWT token from the Authorization header
- Validates the token using the JWT utility
- Attaches decoded user information to `req.user`
- Returns 401 Unauthorized for invalid or missing tokens
- Allows the request to proceed if authentication is successful

**API Details**
- **Usage**: Applied as middleware to protected routes
- **Access Control**: N/A (middleware function)
- **Request Headers**: `Authorization: Bearer <token>`
- **Response**: 401 Unauthorized for failed auth, proceeds to next() for success

**Dependencies**
- **Models**: None
- **Utilities**: `jwt.js` for token verification (`verifyToken` function)
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard JWT authentication pattern
- Generic error message "Action not permitted" for security (doesn't reveal specific auth failure reasons)
- Token format validation ensures proper "Bearer " prefix 