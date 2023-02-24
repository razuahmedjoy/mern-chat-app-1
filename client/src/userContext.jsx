import { useEffect } from "react";
import { createContext, useState } from "react";
import { axiosInstance } from "./utilities/axiosInstance";

export const UserContext = createContext({});

export const UserContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    axiosInstance.get("/profile").then((res) => {
      if (res.request.status === 200) {
        setId(res.data.userId);
        setUsername(res.data.username);
      }
      setLoading(false);
      console.log("setted loading false")
      
    }).catch(err=>{
        setLoading(false);
        console.log("setted loading false")
    });
  
  }, []);
  return (
    <UserContext.Provider
      value={{ username, setUsername, id, setId, loading, setLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};
