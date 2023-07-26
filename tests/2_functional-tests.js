const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const app = require("../app");

chai.use(chaiHttp);
const request = chai.request;

let id1;
let id2;

suite("Functional Tests", function () {
  test("Create an issue with every field: POST request to /api/issues/{project}", async () => {
    const res = await request(app)
      .post("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "Test issue",
        issue_text: "Test issue text",
        created_by: "Chai func test nr 1",
        assigned_to: "nobody :P",
        status_text: "didn't even start",
      });
    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.issue_title, "Test issue");
    assert.equal(responseObj.issue_text, "Test issue text");
    assert.equal(responseObj.created_by, "Chai func test nr 1");
    assert.equal(responseObj.assigned_to, "nobody :P");
    assert.equal(responseObj.status_text, "didn't even start");
    assert.isTrue(responseObj.open);
    id1 = responseObj._id;
  });

  test("Create an issue with only required fields: POST request to /api/issues/{project}", async () => {
    const res = await request(app)
      .post("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "Test issue 2",
        issue_text: "Test issue text",
        created_by: "Chai func test nr 2",
      });
    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.issue_title, "Test issue 2");
    assert.equal(responseObj.issue_text, "Test issue text");
    assert.equal(responseObj.created_by, "Chai func test nr 2");
    assert.equal(responseObj.assigned_to, "");
    assert.equal(responseObj.status_text, "");
    assert.isTrue(responseObj.open);

    id2 = responseObj._id;
  });

  test("Create an issue with missing required fields: POST request to /api/issues/{project}", async () => {
    const res = await request(app)
      .post("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "Test issue 3", //no issue_text
        created_by: "Chai func test nr 3",
      });
    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.error, "required field(s) missing");
  });

  test("View issues on a project: GET request to /api/issues/{project}", async () => {
    const res = await request(app).get("/api/issues/testproject");

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);

    assert.equal(responseObj.length, 2);
    assert.equal(responseObj[1].issue_text, "Test issue text");
    assert.equal(responseObj[1].status_text, "");
    assert.equal(responseObj[1].open, true);
  });

  test("View issues on a project with one filter: GET request to /api/issues/{project}", async () => {
    const res = await request(app).get(
      "/api/issues/testproject?created_by=Chai+func+test+nr+1"
    );

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);

    assert.equal(responseObj.length, 1);
    assert.equal(responseObj[0].issue_text, "Test issue text");
    assert.equal(responseObj[0].status_text, "didn't even start");
    assert.equal(responseObj[0].created_by, "Chai func test nr 1");
    assert.equal(responseObj[0].open, true);
  });

  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", async () => {
    const res = await request(app).get(
      "/api/issues/testproject?open=true&created_by=Chai+func+test+nr+1"
    );

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);

    assert.equal(responseObj.length, 1);
    assert.equal(responseObj[0].issue_text, "Test issue text");
    assert.equal(responseObj[0].status_text, "didn't even start");
    assert.equal(responseObj[0].created_by, "Chai func test nr 1");
    assert.equal(responseObj[0].open, true);
  });

  test("Update one field on an issue: PUT request to /api/issues/{project}", async () => {
    const res = await request(app)
      .put("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: id2,
        open: false,
      });

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.result, "successfully updated");
    assert.equal(responseObj._id, id2);
  });

  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", async () => {
    const res = await request(app)
      .put("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: id1,
        open: false,
        issue_title: "updated title",
      });

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.result, "successfully updated");
    assert.equal(responseObj._id, id1);
  });

  test("Update an issue with missing _id: PUT request to /api/issues/{project}", async () => {
    const res = await request(app)
      .put("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        open: false,
      });

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.error, "missing _id");
  });

  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", async () => {
    const res = await request(app)
      .put("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: id2,
      });

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.error, "no update field(s) sent");
    assert.equal(responseObj._id, id2);
  });

  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", async () => {
    const invalidId = "aldkfjas";
    const res = await request(app)
      .put("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: invalidId,
        open: false,
      });

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.error, "could not update");
    assert.equal(responseObj._id, invalidId);
  });

  test("Delete an issue: DELETE request to /api/issues/{project}", async () => {
    const res = await request(app)
      .delete("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: id1,
      });

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);

    assert.equal(responseObj.result, "successfully deleted");
    assert.equal(responseObj._id, id1);

    const secondDeletion = await request(app)
      .delete("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: id2,
      });
  });

  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", async () => {
    const invalidId = "abcd";
    const res = await request(app)
      .delete("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: invalidId,
      });

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.error, "could not delete");
    assert.equal(responseObj._id, invalidId);
  });

  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", async () => {
    const res = await request(app)
      .delete("/api/issues/testproject")
      .set("content-type", "application/x-www-form-urlencoded");

    assert.equal(res.status, 200);
    let responseObj = JSON.parse(res.res.text);
    assert.equal(responseObj.error, "missing _id");
  });
});
