import React, { useState } from "react";
import { useContext } from "react";
import LoadingScreen from "./LoadingScreen";
import { UserContext } from "./userContext";
import { axiosInstance } from "./utilities/axiosInstance";

const RegisterAndLoginForm = () => {
  const [error,setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
  const { setUsername: setLoggedInUsername, setId,loading,setLoading } = useContext(UserContext);

  const handleSubmit = async (e) => {
    setLoading(true);
    setError(null)
    e.preventDefault();
    try{
      const url = isLoginOrRegister === "register" ? "/register" : "/login";
      const res = await axiosInstance.post(url, { username, password });
      setLoggedInUsername(username);
      setId(res.data.id);
      // console.log(res);
    }
    catch(err){
      console.log(err);
      setError(err?.response?.data?.message);
      
    }
    setLoading(false);

  };

  if(loading){
    return <LoadingScreen/>
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="block w-full rounded-sm p-2 mb-2 focus:outline-blue-500"
          type="text"
          placeholder="username"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-sm p-2 mb-2 focus:outline-blue-500"
          type="password"
          placeholder="password"
        />
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" && (
            <div>
              Already a member?{" "}
              <button onClick={() => setIsLoginOrRegister("login")}>
                Login Here
              </button>
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div>
              Don't Have an account?{" "}
              <button onClick={() => setIsLoginOrRegister("register")}>
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterAndLoginForm;
