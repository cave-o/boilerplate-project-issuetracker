const mongoose = require("mongoose");

module.exports = {
  connect: function() {
    const dsn = `mongodb://mongo:T2m5afOXnCcr6wfal6pI@containers-us-west-136.railway.app:5634`;
    return mongoose.connect(dsn);
  },
}