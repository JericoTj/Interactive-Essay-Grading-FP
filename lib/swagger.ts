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
  },
  apis: ["./app/api/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);