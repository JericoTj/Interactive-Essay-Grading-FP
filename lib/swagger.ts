import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EasyEssays — Interactive Essay Grading API",
      version: "1.0.0",
      description: "API documentation for COMP6703001 Final Project — BINUS University International",
    },
    servers: [
      {
        url: "https://interactive-essay-grading-1411417ci-jericotjs-projects.vercel.app/api",
        description: "Production",
      },
      {
        url: "http://localhost:3000/api",
        description: "Local",
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
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/auth/register": {
        post: {
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                    role: { type: "string", enum: ["STUDENT", "INSTRUCTOR"] },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "User created successfully" },
            "400": { description: "Missing fields or invalid role" },
            "409": { description: "Email already in use" },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Returns JWT token" },
            "401": { description: "Invalid password" },
            "404": { description: "User not found" },
          },
        },
      },
      "/essays": {
        get: {
          summary: "Get all essays",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "List of essays" }, "401": { description: "Unauthorized" } },
        },
        post: {
          summary: "Submit a new essay",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "201": { description: "Essay created" }, "401": { description: "Unauthorized" } },
        },
      },
      "/essays/{id}": {
        get: {
          summary: "Get essay with grading result",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "Essay with grading result" }, "404": { description: "Not found" } },
        },
        delete: {
          summary: "Delete an essay",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "Essay deleted" }, "403": { description: "Forbidden" } },
        },
      },
      "/essays/{id}/grade": {
        post: {
          summary: "Grade an essay using AI",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { rubricText: { type: "string" } },
                },
              },
            },
          },
          responses: {
            "200": { description: "Grading result with scores and annotations" },
            "503": { description: "AI service unavailable" },
          },
        },
      },
      "/rubrics": {
        get: {
          summary: "Get all rubrics",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "List of rubrics" } },
        },
        post: {
          summary: "Create a rubric",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "201": { description: "Rubric created" } },
        },
      },
      "/upload": {
        post: {
          summary: "Upload essay or rubric file to R2",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: { type: "string", format: "binary" },
                    type: { type: "string", enum: ["essay", "rubric"] },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "201": { description: "File uploaded successfully" } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);