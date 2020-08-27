
const dotenv = require('dotenv');
dotenv.config();
var config = {};
config.debug = process.env.DEBUG || false;
config.fastify = {};
config.fastify.port = process.env.FASTIFY_PORT || 3333;
config.fastify.address =  process.env.FASTIFY_ADDRESS || '0.0.0.0';

config.mongodb = {};
config.mongodb.hostname   = process.env.MONGODB_HOSTNAME   || 'localhost';
config.mongodb.port       = process.env.MONGODB_PORT       || 27017;
config.mongodb.database   = process.env.MONGODB_DATABASE   || 'blowing';


module.exports = config;
