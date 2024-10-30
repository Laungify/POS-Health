const africasTalking = require('africastalking');
const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

const smsService = africasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME
});

module.exports = smsService;