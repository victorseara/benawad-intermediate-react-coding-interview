import { rest } from "msw";
import { RANDOM_USER_API_BASE_URL } from "../../App";
import users from "./data/users.json";

const handlers = [
  rest.get(RANDOM_USER_API_BASE_URL, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(users));
  }),
];

export default handlers;
