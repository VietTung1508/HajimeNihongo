import swaggerUi from 'swagger-ui-express'
import {Express} from 'express'
import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HajimeNihongo API',
      version: '1.0.0',
      description: 'API documentation for HajimeNihongo project',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // nơi chứa route để đọc comment
}

const swaggerSpec = swaggerJsdoc(options)

export function setupSwagger(app: Express) {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
