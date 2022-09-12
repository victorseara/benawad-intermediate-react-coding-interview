import { useCallback, useEffect, useRef, useState } from "react";

interface GetUsersResponse {
  name: {
    first: string;
    last: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    postcode: number;
    street: {
      name: string;
      number: number;
    };
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

interface RandomUserApiResponse {
  results: GetUsersResponse[];
}

interface Location {
  name: string;
  city: string;
  state: string;
  country: string;
  postcode: number;
  number: number;
  latitude: number;
  longitude: number;
}

const RANDOM_USER_API_URL = "https://randomuser.me/api/?results=20";

async function getUsers() {
  const response = await fetch(RANDOM_USER_API_URL, { method: "GET" });

  if (!response.ok) {
    return Promise.reject(new Error("Request was not ok!"));
  }

  const data: RandomUserApiResponse = await response.json();

  return data.results;
}

function parseUserToLocation(users: GetUsersResponse[]) {
  return users.map((user) => {
    const location: Location = {
      name: user.location.street.name,
      city: user.location.city,
      country: user.location.country,
      state: user.location.state,
      postcode: user.location.postcode,
      number: user.location.street.number,
      latitude: user.location.coordinates.latitude,
      longitude: user.location.coordinates.longitude,
    };
    return location;
  });
}

function sortLocations(locationKey: keyof Location, order: SortOrder | null) {
  return function (locationA: Location, locationB: Location) {
    const valueOfA = locationA[locationKey];
    const valueOfB = locationB[locationKey];

    if (valueOfA < valueOfB) return order === "asc" ? -1 : 1;
    if (valueOfA > valueOfB) return order === "asc" ? 1 : -1;

    return 0;
  };
}

const sortByLocationKey = (
  locationKey: keyof Location,
  order: SortOrder | null,
  locationsArray: Location[]
) => {
  const locationsCopy = [...locationsArray];
  locationsCopy.sort(sortLocations(locationKey, order));
  return locationsCopy;
};

const toggleSortOrder = (currentOrder: SortOrder | null) => {
  return currentOrder === "asc" ? "desc" : "asc";
};

type SortOrder = "asc" | "desc";

type SortState = {
  key: keyof Location | null;
  order: SortOrder | null;
};

const initialSortState: SortState = {
  key: null,
  order: null,
};

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationKeys, setLocationKeys] = useState<Array<keyof Location>>([]);
  const [sortKey, setSortKey] = useState<SortState>(initialSortState);

  const getLocations = useCallback(async () => {
    const users = await getUsers();
    const locationsResult = parseUserToLocation(users);
    const locationKeysResult = Object.keys(locationsResult[0]);
    setLocationKeys(locationKeysResult as Array<keyof Location>);
    setLocations(locationsResult);
  }, []);

  const handleSelectSortKey = (locationKey: keyof Location) => {
    setSortKey((prevState) => ({
      key: locationKey,
      order:
        locationKey === prevState.key
          ? toggleSortOrder(prevState.order)
          : "desc",
    }));
  };

  const sortedLocations = sortKey.key
    ? sortByLocationKey(sortKey.key, sortKey.order, locations)
    : locations;

  useEffect(() => {
    getLocations();
  }, []);

  const renderTableHead = (tableHeadData: Array<keyof Location>) => {
    return (
      <thead>
        <tr>
          {tableHeadData.map((headerItem) => (
            <th
              onClick={() => handleSelectSortKey(headerItem)}
              key={headerItem}
            >
              {headerItem}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderTableBody = (
    tableHeadData: Array<keyof Location>,
    tableBodyData: Location[]
  ) => {
    return (
      <tbody>
        {tableBodyData.map((row, rowIndex) => (
          <tr key={`${row.name}-${rowIndex}`}>
            {tableHeadData.map((headerItem) => (
              <td key={`${headerItem}-${rowIndex}`}>{row[headerItem]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div>
      <table>
        {renderTableHead(locationKeys)}
        {renderTableBody(locationKeys, sortedLocations)}
      </table>
    </div>
  );
}

export default App;
