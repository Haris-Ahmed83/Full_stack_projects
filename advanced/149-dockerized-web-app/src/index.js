const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Dockerized Web App! This is Project #149.');
});

app.listen(port, () => {
  console.log(`Web app listening at http://localhost:${port}`);
});
