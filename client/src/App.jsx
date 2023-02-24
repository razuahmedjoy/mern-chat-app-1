import "./App.css";
import Routes from "./Routes";
import { UserContextProvider } from "./userContext";

function App() {
  return (
    <UserContextProvider>
      <Routes/>
    </UserContextProvider>
  );
}

export default App;
