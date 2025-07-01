import swaggerAutogen from 'swagger-autogen';

const outfile = './swagger_output.json';
const endpointsFiles = ['./app.js'];

const doc = {
  info: {
    title: 'API de Geoasistencia',
    description: 'Documentación de la API de Geoasistencia',
  },
  host: '54.210.246.199',
  schemes: ['http', 'https'],
}


swaggerAutogen()(outfile, endpointsFiles, doc);
