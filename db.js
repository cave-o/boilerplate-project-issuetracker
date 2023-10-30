const mongoose = require("mongoose");

module.exports = {
  connect: function() {
    const dsn = `mongodb+srv://dbKevCRUD:Ri8j0DzxF1mxpwpC@cluster0.ius1f.mongodb.net/`;
    return mongoose.connect(dsn);
  },
}