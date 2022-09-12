import { afterAll, afterEach, beforeAll, expect } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";
import server from "./libs/msw/server";
import { fetch } from "cross-fetch";

expect.extend(matchers);
global.fetch = fetch;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
