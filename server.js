"use strict";

const express = require("express");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");
const app = require("./app.js");

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
const apiRoutes = require("./routes/api.js");
const router = express.Router();
app.use("/", router);
apiRoutes(router);

//Sample front-end
app.route("/:project/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/issue.html");
});

//Index page (static HTML)
app.route("/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404).type("text").send("Not Found");
});

(async () => {
  const db = require("./db");
  try {
    await db.connect();
    console.log("connected to db");
  } catch (err) {
    console.log("an error occurred while connecting to db", err);
  }

  //Start our server and tests!
  const listener = app.listen(process.env.PORT || 3000, function() {
    console.log("Your app is listening on port " + listener.address().port);
    if (process.env.NODE_ENV === "test") {
      console.log("Running Tests...");
      setTimeout(function() {
        try {
          runner.run();
        } catch (e) {
          console.log("Tests are not valid:");
          console.error(e);
        }
      }, 5000);
    }
  });
})();

module.exports = app; //for testing
