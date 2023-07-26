'use strict';

module.exports = function(router) {
  const Project = require("../db_model.js");

  router.route('/api/issues/:project')
    .get(async function(req, res) {
      let projectTitle = req.params.project;
      try {
        const project = await Project.findOne({ project_title: projectTitle });
        const issues = project.issues.filter((el) => {
          let trueSoFar = true;
          for (let field of Object.keys(req.query)) {
            // console.log("loop", field, el[field], req.query[field]);
            if (String(el[field]) != req.query[field]) {
              trueSoFar = false;
            }
          }
          return trueSoFar;
        });

        res.json(issues);
      } catch (err) {
        res.send("This project does not exist");
        console.log(err);
      }
    })

    .post(async function(req, res) {
      let projectTitle = req.params.project;
      //check if that project exists
      const result = await Project.find({ project_title: projectTitle });
      if (result.length == 0) {
        const newProject = new Project({ project_title: projectTitle });
        try {
          await newProject.save()
        } catch (err) {
          console.log("an error occurred when saving new project", err);
        }
      }

      try {
        const project = await Project.findOne({ project_title: projectTitle });
        project.issues.push({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || "",
          status_text: req.body.status_text || "",
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        });

        try {
          await project.save();
          const issueId = project.issues[project.issues.length - 1]._id;
          res.json({
            _id: issueId,
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to || "",
            status_text: req.body.status_text || "",
            created_on: new Date(),
            updated_on: new Date(),
            open: true
          });
        } catch (err) {
          //check if its a required field error
          let reqField = false;
          for (let elem of Object.keys(err.errors)) {
            if (err.errors[elem].kind == "required") {
              reqField = true;
            }
          }
          if (reqField) {
            res.json({
              error: 'required field(s) missing'
            });
            return;
          }
        }
      } catch (err) {
        console.log("an err occurred", err);
      }
    })

    .put(async function(req, res) {
      try {
        let projectTitle = req.params.project;
        if (!req.body._id) {
          res.json({ error: 'missing _id' });
          return;
        }

        let valuesToUpdate = {};
        for (let reqKey of Object.keys(req.body)) {
          if (reqKey !== "_id" && req.body[reqKey] !== "") {
            valuesToUpdate[reqKey] = req.body[reqKey];
          }
        }

        if (Object.keys(valuesToUpdate).length == 0) {
          res.json({ error: 'no update field(s) sent', '_id': req.body._id });
          return;
        }

        const project = await Project.findOne({ "project_title": projectTitle });
        if (!project) {
          //go to catch block
          throw new Exception();
        }
        const issue = project.issues.filter((el) => el._id == req.body._id)[0];
        if (!issue) {
          //go to catch block
          throw new Exception();
        }

        for (let updateKey of Object.keys(valuesToUpdate)) {
          if (updateKey == "open") {
            //convert string to bool
            valuesToUpdate[updateKey] = JSON.parse(valuesToUpdate[updateKey]);
          }
          issue[updateKey] = valuesToUpdate[updateKey];
        }

        issue["updated_on"] = new Date();
        await project.save();

        res.json({ result: 'successfully updated', '_id': req.body._id });
      } catch (err) {
        res.json({ error: 'could not update', '_id': req.body._id });
      }
    })

    .delete(async function(req, res) {
      let projectTitle = req.params.project;

      try {
        if (!Object.keys(req.body).includes("_id")) {
          res.json({ error: 'missing _id' });
          return;
        }
        const project = await Project.findOne({ "issues._id": req.body._id });
        const issue = project.issues.filter((el) => el._id == req.body._id)[0];
        const index = project.issues.indexOf(issue);
        
        project.issues.splice(index, 1);
        project.save();
        res.json({ result: 'successfully deleted', '_id': req.body._id });
      } catch (err) {
        res.json({ error: 'could not delete', '_id': req.body._id })
      }
    });
};