import { useCallback, useEffect, useState } from "react";

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

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationKeys, setLocationKeys] = useState<Array<keyof Location>>([]);

  const getLocations = useCallback(async () => {
    const users = await getUsers();
    const locationsResult = parseUserToLocation(users);
    const locationKeysResult = Object.keys(locationsResult[0]);
    setLocationKeys(locationKeysResult as Array<keyof Location>);
    setLocations(locationsResult);
  }, []);

  const renderTableHead = (tableHeadData: Array<keyof Location>) => {
    return (
      <thead>
        <tr>
          {tableHeadData.map((headerItem) => (
            <th key={headerItem}>{headerItem}</th>
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
              <td key={`${headerItem}-${rowIndex}`}>
                <td>{row[headerItem]}</td>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  useEffect(() => {
    getLocations();
  }, []);

  return (
    <div>
      <table>
        {renderTableHead(locationKeys)}
        {renderTableBody(locationKeys, locations)}
      </table>
    </div>
  );
}

export default App;
