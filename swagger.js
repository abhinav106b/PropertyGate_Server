const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Backend API documentation',
    description: 'Assignment Documentation',
  },
  host: "localhost:3000",
  schemes: ['http', 'https'], 
};

const outputFile = './swagger-output.json';

const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);