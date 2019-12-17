const date = require('date-and-time');
const fastify = require('fastify')({
  logger: true,
  ignoreTrailingSlash: true
})

fastify.register(require('fastify-mongodb'), {
  // force to close the mongodb connection when app stopped
  // the default value is false
  forceClose: true,
  
  url: 'mongodb://localhost/blowing'
})

fastify.get('/station/:id', function (req, reply) {
  // Or this.mongo.client.db('mydb')
  
console.log("Richiesta stazione: " + req.params.id);
const db = this.mongo.db
  db.collection(req.params.id, onCollection)
  function onCollection (err, col) {
    if (err) return reply.send(err)
	const time = date.format(date.addHours(new Date, -1), "YYYY-MM-DDTHH:mm:ss", true);
	
    col.find({time: {$gte: time}}, {sort:{"time" : -1}}).toArray( (err, values) => {
      reply.send(values)
    })
  }
})



fastify.listen(3333, '0.0.0.0', err => {
  if (err) throw err
})
