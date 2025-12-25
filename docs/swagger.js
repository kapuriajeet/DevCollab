
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "DevCollab API",
    version: "1.0.0",
    description: "Backend API documentation for DevCollab",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server",
    },
    // {
    //   url: "https://api.devcollab.com/api",
    //   description: "Production server",
    // },
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
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // where swagger comments live
};

export const swaggerSpec = swaggerJSDoc(options);
