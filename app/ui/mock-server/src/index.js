const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./schema');
const mocks = require('./mock');
const casual = require('casual');

const app = express();
app.use(
  bodyParser.json(),
  cors({ origin: 'http://localhost:3001', credentials: true })
);

// If you want to simulate a timeout you can uncomment these lines.
// This function simply generate a random timeout and then it will return the response from the graphQL server.
// Probably there is a better solution than this, but for dev environment it seems works fine.
// app.use(async (_, __, next) => {
//   const randomWait = casual.integer(200, 2000);
//   await new Promise((resolve) => setTimeout(resolve, randomWait));
//
//   next();
// });

// # This endpoint is used to test unauthorized response
// app.post('/graphql', (req, res) => {
//   return res.status(401)
//     .send({"code": "unauthorized", "message": "Unauthorized user"});
// });

const server = new ApolloServer({ typeDefs, mocks });

server.applyMiddleware({ app, path: '/api/query', cors: false });

const appServer = app.listen(4000, () => {
  const address = appServer.address();
  console.log(`🚀 Server ready at ${address.address}${address.port}`);
});
