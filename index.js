const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });

mongoose.connect("mongodb://localhost:27017/contact-manager",{
    useNewUrlParser: true
  }).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});