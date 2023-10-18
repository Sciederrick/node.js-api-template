const request = require("supertest");

const { createRandomString } = require("./util/helper.util")

const baseUrl = `http://localhost:3005`;

describe("User auth endpoint", () => {
  const ASYNC_TIMEOUT = 20_000;
  const fakePassword = "12345678";
	const recordIds = new Set();

	afterAll(async () => {
		if (recordIds.size > 0) {
			await request(baseUrl)
			.delete("/api/v1/user/")
			.query({
				ids: [...recordIds]
			})
			.set("Accept", "application/json");
		}
	});

  it(
    "should return a 201 status code on new user registration",
    async () => {
      const fakeEmail = `${createRandomString(8)}@example.com`;
      const response = await request(baseUrl)
			.post("/api/v1/auth/register")
			.send({
				email: fakeEmail,
				password: fakePassword,
			})
			.set("Accept", "application/json");

			if (response.body?._id) recordIds.add(response.body._id); // remember for teardown after all tests

      expect(response.statusCode).toBe(201);
    },
    ASYNC_TIMEOUT
  );

  it(
    "should return a 409 status code when a user with that email already exists",
    async () => {
			const fakeEmail = "janedoe@example.com";
      let response;
      for (let i = 0; i < 2; i++) {
        response = await request(baseUrl)
          .post("/api/v1/auth/register")
          .send({
            email: fakeEmail,
            password: fakePassword,
          })
          .set("Accept", "application/json");

				if (response.body?._id) recordIds.add(response.body._id);
      }

      expect(response.statusCode).toBe(409);
    },
    ASYNC_TIMEOUT
  );
});
