/* eslint-disable no-undef */
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { BASE_URL, NODE_ENV, PORT } from '@shared/constants';

const serverUrl = BASE_URL || `http://localhost:${PORT}/api`;

const isCompiled = __filename.endsWith('.js');
const apisGlob = isCompiled
  ? [path.join(__dirname, '../../**/*.js')]
  : ['./src/**/*.ts'];

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Salon Booking API',
      version: '1.0.0',
      description: 'API documentation for Salon Booking System',
    },
    servers: [
      {
        url: serverUrl,
        description:
          NODE_ENV === 'production'
            ? 'Production server'
            : 'Development server',
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
  apis: apisGlob,
};

export const swaggerSpec = swaggerJsdoc(options);
