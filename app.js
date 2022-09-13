const express = require('express');
const cors = require("cors")
const contactRouter = require('./routes/contactRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use((cors()));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET PUT PATCH POST DELETE');
  res.setHeader(
    "Access-Control-Allow-Methods",
    "Content-Type",
    "Authorization"
  );
  next();
});

app.use('/api/v1/contacts', contactRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;