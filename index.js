const date = require('date-and-time');
const config = require('./config');

const fastify = require('fastify')({
  logger: config.debug,
  ignoreTrailingSlash: true
})

fastify.register(require('fastify-mongodb'), {
  // force to close the mongodb connection when app stopped
  // the default value is false
  forceClose: true,
  database: config.mongodb.database,
  url: 'mongodb://' + config.mongodb.hostname + ':' + config.mongodb.port
})

fastify.get('/station/:id/last', function (req, reply) {

  
  const db = this.mongo.db
  db.collection(req.params.id, onCollection)
  function onCollection(err, col) {
    if (err) return reply.send(err)
    const time = date.format(date.addHours(new Date, -1), "YYYY-MM-DDTHH:mm:ss", true);

    col.find({ time: { $gte: time } }, { sort: { "time": -1 } }).toArray((err, values) => {
      reply.send(values)
    })
  }
})

fastify.get('/station/:id/hourly', function (req, reply) {

  
  const db = this.mongo.db
  db.collection(req.params.id + "_hourly", onCollection)
  function onCollection(err, col) {
    if (err) return reply.send(err)
    col.find({}, { sort: { _id: -1 } }).toArray((err, values) => {
      reply.send(values)
    })
  }
})


fastify.get('/station/:id/lastmax', function (req, reply) {

  
  const db = this.mongo.db
  db.collection(req.params.id, onCollection)
  function onCollection(err, col) {
    if (err) return reply.send(err)
    const time = date.format(date.addHours(new Date(), -1), "YYYY-MM-DDTHH:mm:ss", true);
    const updated = date.format(new Date(), "YYYY-MM-DDTHH:mm:ssZ", true);
        const aggI = col.aggregate([
            {$match: {time: {$gte: time}}},
            {$project : { 
                time:1, _id: 0, 
                speed: {$arrayElemAt: [ "$inst", 4 ]},
                dir: {$arrayElemAt: [ "$inst", 5 ]}},
            },
            {$sort: {speed: -1}},
            {$limit: 1}]).toArray((err, values) => {
              reply.send({...values.pop(), updated})
            });
  }
})



fastify.listen(config.fastify.port, config.fastify.address, err => {
  if (err) throw err
})
