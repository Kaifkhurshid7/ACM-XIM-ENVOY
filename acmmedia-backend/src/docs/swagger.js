/**
 * Swagger/OpenAPI Documentation Configuration
 * Documentation is served at /api-docs in development and production.
 * 
 * @module docs/swagger
 */

const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ACM Media API",
      version: "1.0.0",
      description:
        "REST API documentation for the ACM-XIM-ENVOY platform. " +
        "Provides endpoints for authentication, posts, events, forum, and admin operations.",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local development",
      },
      {
        url: "https://acmmedia-backend.onrender.com/api/v1",
        description: "Production (Render)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            role: { type: "string", enum: ["member", "admin"] },
            adminSecret: { type: "string" },
            isAcmMember: { type: "boolean" },
            acmId: { type: "string" },
          },
        },
        Post: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            author: { type: "string" },
            likes: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Event: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
            location: { type: "string" },
            registrationLink: { type: "string" },
            isPast: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ForumThread: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            author: { type: "string" },
            replies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user: { type: "string" },
                  text: { type: "string" },
                },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
          },
          responses: { 200: { description: "Registered" }, 400: { description: "Validation error" } },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and receive JWT token",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
          },
          responses: { 200: { description: "Token returned" }, 400: { description: "Auth error" } },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "User profile" }, 401: { description: "Unauthorized" } },
        },
      },
      "/posts": {
        get: {
          tags: ["Posts"],
          summary: "List all posts",
          responses: { 200: { description: "Posts array" } },
        },
        post: {
          tags: ["Posts"],
          summary: "Create post (admin)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Post created" }, 403: { description: "Forbidden" } },
        },
      },
      "/posts/{id}": {
        get: {
          tags: ["Posts"],
          summary: "Get post by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Post" }, 404: { description: "Not found" } },
        },
        patch: {
          tags: ["Posts"],
          summary: "Update post (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Updated" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Posts"],
          summary: "Delete post (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } },
        },
      },
      "/posts/like/{id}": {
        put: {
          tags: ["Posts"],
          summary: "Toggle like on a post",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Updated likes array" } },
        },
      },
      "/events": {
        get: { tags: ["Events"], summary: "List all events", responses: { 200: { description: "Events array" } } },
        post: { tags: ["Events"], summary: "Create event (admin)", security: [{ bearerAuth: [] }], responses: { 200: { description: "Created" } } },
      },
      "/events/{id}": {
        get: { tags: ["Events"], summary: "Get event by ID", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Event" } } },
        patch: { tags: ["Events"], summary: "Update event (admin)", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Updated" } } },
        delete: { tags: ["Events"], summary: "Delete event (admin)", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } },
      },
      "/forum": {
        get: { tags: ["Forum"], summary: "List forum threads", responses: { 200: { description: "Threads array" } } },
        post: { tags: ["Forum"], summary: "Create thread", security: [{ bearerAuth: [] }], responses: { 200: { description: "Created" } } },
      },
      "/forum/reply/{id}": {
        post: { tags: ["Forum"], summary: "Reply to thread", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Reply added" } } },
      },
      "/forum/{id}": {
        delete: { tags: ["Forum"], summary: "Delete thread (admin)", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } },
      },
      "/admin/stats": {
        get: { tags: ["Admin"], summary: "Get platform analytics", security: [{ bearerAuth: [] }], responses: { 200: { description: "Analytics object" } } },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJSDoc(options);
