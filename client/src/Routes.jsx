import React from "react";
import { useContext } from "react";
import Chat from "./Chat";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import { UserContext } from "./userContext";

const Routes = () => {
  const { username, id } = useContext(UserContext);
  console.log(username, id);
  
  if(username){
    return <Chat/>
  }

  return <RegisterAndLoginForm />;
};

export default Routes;
