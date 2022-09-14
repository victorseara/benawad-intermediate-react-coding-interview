import { logRoles, render, screen, within } from "@testing-library/react";
import { assert, describe, expect, test } from "vitest";
import App, {
  parseUserToLocation,
  RandomUserApiResponse,
  sortByLocationKey,
  SortOrder,
  UserLocation,
} from "./App";
import users from "./libs/msw/data/users.json";
import userEvent from "@testing-library/user-event";

const mockUsers = users as unknown as RandomUserApiResponse;
const locations = parseUserToLocation(mockUsers.results);
const locationKeys = Object.keys(locations[0]) as Array<keyof UserLocation>;

const getSortLocationTestCases = () => {
  return locationKeys
    .map((key) => [
      { key, order: SortOrder.ASC },
      { key, order: SortOrder.DESC },
    ])
    .flat();
};

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

  test.each(locationKeys)(
    "Click in %s columheader should order table rows",
    async (locationKey) => {
      render(<App />);

      const table = screen.getByRole("table");
      await within(table).findAllByRole("columnheader");

      const unorderedRows = screen
        .getAllByRole("row")
        .map((item) => item.innerHTML);

      await userEvent.click(
        screen.getByRole("columnheader", { name: locationKey })
      );

      const orderedRows = screen
        .getAllByRole("row")
        .map((item) => item.innerHTML);

      assert.notSameOrderedMembers(orderedRows, unorderedRows);
    }
  );

  test.each(locationKeys)(
    "Click twice in %s columheader invert table rows",
    async (locationKey) => {
      render(<App />);

      const table = screen.getByRole("table");
      await within(table).findAllByRole("columnheader");

      const unorderedRows = screen
        .getAllByRole("row")
        .map((item) => item.innerHTML);

      await userEvent.click(
        screen.getByRole("columnheader", { name: locationKey })
      );

      const ascOrdered = screen
        .getAllByRole("row")
        .map((item) => item.innerHTML);

      assert.notSameOrderedMembers(ascOrdered, unorderedRows);

      await userEvent.click(
        screen.getByRole("columnheader", { name: locationKey })
      );

      const descOrdered = screen
        .getAllByRole("row")
        .map((item) => item.innerHTML);

      assert.notSameOrderedMembers(descOrdered, ascOrdered);
    }
  );

  test.each(getSortLocationTestCases())(
    "sort locations %o",
    ({ key, order }) => {
      const orderedLocations = sortByLocationKey(key, order, locations);

      assert.notSameDeepOrderedMembers(orderedLocations, locations);

      for (let i = 0; i + 1 < orderedLocations.length; i++) {
        const itemA = orderedLocations[i][key];
        const itemB = orderedLocations[i + 1][key];

        if (order === SortOrder.ASC) {
          assert.isTrue(itemA >= itemB);
        } else {
          assert.isTrue(itemA <= itemB);
        }
      }
    }
  );

  test.each(locationKeys)("search by %o", async (key) => {
    render(<App />);

    const table = screen.getByRole("table");
    await within(table).findAllByRole("columnheader");

    const location = locations[0];
    const searchValue = location[key].toString();

    const allRows = screen.getAllByRole("row");

    expect(allRows).toHaveLength(locations.length + 1);

    await userEvent.type(
      screen.getByRole("textbox", { name: /search/i }),
      searchValue
    );

    const filteredRows = screen.getAllByRole("row");
    expect(filteredRows.length).toBeLessThan(allRows.length);

    const locationRow = Object.values(location).join(" ");

    expect(screen.getByRole("row", { name: locationRow })).toBeInTheDocument();
  });
});
