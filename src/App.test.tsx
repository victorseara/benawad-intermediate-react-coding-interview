import { logRoles, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import App, { parseUserToLocation, RandomUserApiResponse } from "./App";
import users from "./libs/msw/data/users.json";

const mockUsers = users as unknown as RandomUserApiResponse;
describe("App test", () => {
  test("Render a line for each user", async () => {
    render(<App />);

    const table = screen.getByRole("table");
    const tableHead = await within(table).findAllByRole("columnheader");
    const tableRows = await within(table).findAllByRole("row");

    expect(tableHead).toHaveLength(8);
    expect(tableRows).toHaveLength(mockUsers.results.length + 1);
  });

  test("Render table head correctly", async () => {
    render(<App />);

    const table = screen.getByRole("table");
    await within(table).findAllByRole("columnheader");

    const firstUser = mockUsers.results[0];
    const firstUserLocation = parseUserToLocation([firstUser])[0];

    for (const key in firstUserLocation) {
      expect(
        screen.getByRole("columnheader", { name: key })
      ).toBeInTheDocument();
    }
  });

  test("Render an user location in a table row", async () => {
    render(<App />);

    const table = screen.getByRole("table");
    await within(table).findAllByRole("columnheader");

    const firstUser = mockUsers.results[0];
    const firstUserLocation = parseUserToLocation([firstUser])[0];

    const locationValues = Object.values(firstUserLocation);

    for (const value of locationValues) {
      expect(
        within(table).getAllByRole("cell", { name: value }).length
      ).toBeGreaterThanOrEqual(1);
    }
  });
});
