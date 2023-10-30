require('dotenv').config();

const mongoose = require("mongoose");

module.exports = {
  connect: function() {
    const dsn = process.env.MONGODB_URI;
    return mongoose.connect(dsn);
  },
}