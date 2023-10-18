const request = require("supertest");

const {
  createRandomString,
  decodeJsonWebToken,
} = require("./util/helper.util");

const baseUrl = `http://localhost:3005`;

describe("User auth endpoint", () => {
  const ASYNC_TIMEOUT = 20_000;
  const fakeEmail = "janedoe@example.com";
  const fakePassword = "12345678";
  let userIds = new Set();
  let accessToken;

  afterAll(async () => {
    userIds = [...userIds];
    console.log(
      "🚀 ~ file: user.auth.spec.js:19 ~ afterAll ~ recordIds:",
      userIds
    );
    if (userIds.length > 0) {
      await request(baseUrl)
        .delete("/api/v1/user/")
        .query({
          ids: userIds,
        })
        .set("Accept", "application/json")
        .set("Content-Type", "application/json");

      await request(baseUrl)
        .delete("/api/v1/auth/token/all")
        .send({
          userIds: userIds,
        })
        .set("Accept", "application/json")
        .set("Content-Type", "application/json");
    }

    jest.resetModules();
  });

  it(
    "should return a 201 status code on new user registration",
    async () => {
      const fakeRandomEmail = `${createRandomString(8)}@example.com`;
      const response = await request(baseUrl)
        .post("/api/v1/auth/register")
        .send({
          email: fakeRandomEmail,
          password: fakePassword,
        })
        .set("Accept", "application/json");

      if (response.body?._id) userIds.add(response.body._id); // remember for teardown after all tests

      expect(response.statusCode).toBe(201);
    },
    ASYNC_TIMEOUT
  );

  it(
    "should return a 409 status code when a user with that email already exists",
    async () => {
      let response;
      for (let i = 0; i < 2; i++) {
        response = await request(baseUrl)
          .post("/api/v1/auth/register")
          .send({
            email: fakeEmail,
            password: fakePassword,
          })
          .set("Accept", "application/json");

        if (response.body?._id) userIds.add(response.body._id);
      }

      expect(response.statusCode).toBe(409);
    },
    ASYNC_TIMEOUT
  );

  it(
    "should return a 200 status code with the accessToken when a user logs in with email and password",
    async () => {
      const response = await request(baseUrl)
        .post("/api/v1/auth/login")
        .send({
          email: fakeEmail,
          password: fakePassword,
        })
        .set("Accept", "application/json");

      if (response.body?.token) accessToken = response.body.token;

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.role).toBeTruthy();
    },
    ASYNC_TIMEOUT
  );

  it("should return a 200 status code and expiration time when a user extends the session - extends token validity", async () => {
    const response = await request(baseUrl)
      .put("/api/v1/auth/token")
      .send({
        id: decodeJsonWebToken(accessToken).id,
        extend: true,
      })
      .set("Accept", "application/json")
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body.expires).toBeTruthy();
  });

  it("should return a 200 status code when the user logs out - deletes token", async () => {
    const response = await request(baseUrl)
      .delete("/api/v1/auth/token")
      .send({
        id: decodeJsonWebToken(accessToken).id,
      })
      .set("Accept", "application/json");

    expect(response.statusCode).toBe(200);
  });
});
