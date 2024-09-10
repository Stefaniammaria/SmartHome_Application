import "./App.scss";
import { React } from "react";
import { Routes, Route } from "react-router-dom";
import LogInPage from "./Pages/LogInPage";
import CONFIG from "./Constants/Config";
import RequireAuth from "./Components/RequireAuth";
import NavBar from "./Components/NavBar";
import SensorsPage from "./Pages/SensorsPage";
import RegisterPage from "./Pages/RegisterPage";

function App() {

  const routes = (
    <NavBar>
      <Routes>
        <Route path={"/Sensors"} element={<SensorsPage/>}></Route>
      </Routes>
    </NavBar>
  );

  const page_router = CONFIG.ENV === "PRODUCTION" ? <RequireAuth>{routes}</RequireAuth> : routes;

  return (
    <Routes>
      <Route path={"/Login"} element={<LogInPage />} />
      <Route path={"/Register"} element={<RegisterPage/>}></Route>
      <Route path="*" element={page_router} />
    </Routes>
  );
}

export default App;
