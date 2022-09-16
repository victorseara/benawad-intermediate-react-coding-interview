import { ChangeEvent, useCallback, useEffect, useState, useMemo} from "react";

interface GetUsersResponse {
  name: {
    first: string;
    last: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    postcode: string | number;
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

export interface RandomUserApiResponse {
  results: GetUsersResponse[];
}

export interface UserLocation {
  name: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  number: number;
  latitude: number;
  longitude: number;
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export const RANDOM_USER_API_BASE_URL = "https://randomuser.me/api";
const GET_USERS_URL = `${RANDOM_USER_API_BASE_URL}/?results=20`;

async function getUsers() {
  const response = await fetch(GET_USERS_URL, { method: "GET" });

  if (!response.ok) {
    return Promise.reject(new Error("Request was not ok!"));
  }

  const data: RandomUserApiResponse = await response.json();

  return data.results;
}

export function parseUserToLocation(users: GetUsersResponse[]) {
  return users.map((user) => {
    const location: UserLocation = {
      name: user.location.street.name,
      city: user.location.city,
      country: user.location.country,
      state: user.location.state,
      postcode: user.location.postcode.toString(),
      number: user.location.street.number,
      latitude: user.location.coordinates.latitude,
      longitude: user.location.coordinates.longitude,
    };
    return location;
  });
}

function sortLocations(
  locationKey: keyof UserLocation,
  order: SortOrder | null
) {
  return function (locationA: UserLocation, locationB: UserLocation) {
    const valueOfA = locationA[locationKey];
    const valueOfB = locationB[locationKey];

    if (valueOfA < valueOfB) return order === SortOrder.ASC ? 1 : -1;
    if (valueOfA > valueOfB) return order === SortOrder.ASC ? -1 : 1;

    return 0;
  };
}

export const sortByLocationKey = (
  locationKey: keyof UserLocation,
  order: SortOrder | null,
  locationsArray: UserLocation[]
) => {
  const locationsCopy = [...locationsArray];
  locationsCopy.sort(sortLocations(locationKey, order));
  return locationsCopy;
};

const toggleSortOrder = (currentOrder: SortOrder | null) => {
  return currentOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
};

const filterLocationsBySearchText = (
  searchText: string,
  locations: UserLocation[]
) => {
  return locations.filter((location) =>
    Object.values(location).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );
};

type SortState = {
  key: keyof UserLocation | null;
  order: SortOrder | null;
};

const initialSortState: SortState = {
  key: null,
  order: null,
};

function App() {
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [locationKeys, setLocationKeys] = useState<Array<keyof UserLocation>>(
    []
  );
  const [sortKey, setSortKey] = useState<SortState>(initialSortState);
  const [searchText, setSearchText] = useState("");

  const getLocations = useCallback(async () => {
    const users = await getUsers();
    const locationsResult = parseUserToLocation(users);
    const locationKeysResult = Object.keys(locationsResult[0]);
    setLocationKeys(locationKeysResult as Array<keyof UserLocation>);
    setLocations(locationsResult);
  }, []);

  const handleSelectSortKey = (locationKey: keyof UserLocation) => {
    setSortKey((prevState) => ({
      key: locationKey,
      order:
        locationKey === prevState.key
          ? toggleSortOrder(prevState.order)
          : SortOrder.ASC,
    }));
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const filteredLocations = searchText
    ? filterLocationsBySearchText(searchText, locations)
    : locations;

  const sortedLocations = sortKey.key
    ? sortByLocationKey(sortKey.key, sortKey.order, filteredLocations)
    : filteredLocations;

  useEffect(() => {
    getLocations();
  }, []);

  const renderTableHead = (tableHeadData: Array<keyof UserLocation>) => {
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
    tableHeadData: Array<keyof UserLocation>,
    tableBodyData: UserLocation[]
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
      <label htmlFor="search">
        Search
        <input
          id="search"
          placeholder="Type to search in the table"
          value={searchText}
          onChange={handleSearch}
        />
      </label>
      <table>
        {renderTableHead(locationKeys)}
        {renderTableBody(locationKeys, sortedLocations)}
      </table>
    </div>
  );
}

export default App;
