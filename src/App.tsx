import { useEffect } from "react";

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

const RANDOM_USER_API_URL = "https://randomuser.me/api/?results=20";

async function getUsers() {
  const response = await fetch(RANDOM_USER_API_URL, { method: "GET" });

  if (!response.ok) {
    return Promise.reject(new Error("Request was not ok!"));
  }

  const data: GetUsersResponse = await response.json();

  return data;
}

function App() {
  useEffect(() => {
    getUsers().then((data) => console.log(data));
  }, []);
  return <div>Hello, World.</div>;
}

export default App;
