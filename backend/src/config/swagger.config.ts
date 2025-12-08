import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Áudio",
      version: "1.0.0",
      description: "Documentação da API do projeto de transcrição e geração de atas.",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },

  // Caminhos onde estão suas rotas (para ler os comentários JSDoc)
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
