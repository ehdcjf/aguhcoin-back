
const winston = require('winston');
const {format} = require('winston');

const logger = winston.createLogger({
  level:'info',
  format:winston.format.json(),
})

if(process.env.NODE_ENV !== 'production'){
  logger.add(new winston.transports.Console({format:format.simple()}));
}

module.exports  = logger;