const swaggerJSDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "ACM Media API",
            version: "1.0.0",
            description: "API documentation for ACM Media backend"
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1",
                description: "Local development"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas: {
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 6 }
                    }
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
                        acmId: { type: "string" }
                    }
                },
                Post: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        title: { type: "string" },
                        content: { type: "string" },
                        author: { type: "string" },
                        likes: { type: "array", items: { type: "string" } },
                        createdAt: { type: "string", format: "date-time" }
                    }
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
                        createdAt: { type: "string", format: "date-time" }
                    }
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
                                    text: { type: "string" }
                                }
                            }
                        },
                        createdAt: { type: "string", format: "date-time" }
                    }
                }
            }
        },
        paths: {
            "/auth/register": {
                post: {
                    tags: ["Auth"],
                    summary: "Register user",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RegisterRequest" }
                            }
                        }
                    },
                    responses: {
                        200: { description: "Registered" },
                        400: { description: "Validation error" }
                    }
                }
            },
            "/auth/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Login",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/LoginRequest" }
                            }
                        }
                    },
                    responses: {
                        200: { description: "Token returned" },
                        400: { description: "Validation or auth error" }
                    }
                }
            },
            "/posts": {
                get: {
                    tags: ["Posts"],
                    summary: "List posts",
                    responses: {
                        200: {
                            description: "Posts list",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Post" }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    tags: ["Posts"],
                    summary: "Create post (admin)",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Post created" },
                        403: { description: "Forbidden" }
                    }
                }
            },
            "/posts/{id}": {
                get: {
                    tags: ["Posts"],
                    summary: "Get post by id",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Post returned" }, 404: { description: "Post not found" } }
                },
                patch: {
                    tags: ["Posts"],
                    summary: "Update post (admin)",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Post updated" }, 404: { description: "Post not found" } }
                },
                delete: {
                    tags: ["Posts"],
                    summary: "Delete post (admin)",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Post deleted" }, 404: { description: "Post not found" } }
                }
            },
            "/events": {
                get: { tags: ["Events"], summary: "List events", responses: { 200: { description: "Events list" } } },
                post: {
                    tags: ["Events"],
                    summary: "Create event (admin)",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Event created" } }
                }
            },
            "/events/{id}": {
                get: {
                    tags: ["Events"],
                    summary: "Get event by id",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Event returned" }, 404: { description: "Event not found" } }
                },
                patch: {
                    tags: ["Events"],
                    summary: "Update event (admin)",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Event updated" }, 404: { description: "Event not found" } }
                },
                delete: {
                    tags: ["Events"],
                    summary: "Delete event (admin)",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Event deleted" }, 404: { description: "Event not found" } }
                }
            },
            "/forum": {
                get: { tags: ["Forum"], summary: "List forum threads", responses: { 200: { description: "Threads list" } } },
                post: {
                    tags: ["Forum"],
                    summary: "Create thread",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Thread created" } }
                }
            },
            "/forum/reply/{id}": {
                post: {
                    tags: ["Forum"],
                    summary: "Reply to thread",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Reply added" }, 404: { description: "Thread not found" } }
                }
            }
        }
    },
    apis: []
};

module.exports = swaggerJSDoc(options);