import { createBrowserRouter } from "react-router";
import Signin from "../components/Signin";
import Pricing from "../components/Pricing";
import Hero from "../pages/Hero";
import App from "../App";
import Dashboard from "../components/Dashboard";
import UserSpace from "../pages/UserSpace";
import UserProfile from "../pages/Home";
import Home from "../pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: Hero },
      { path: "signin", Component: Signin },
      { path: "pricing", Component: Pricing },
      { path: "home", Component: Home },
      {path: ":username", Component: UserSpace, 
        children: [
          {index: true, Component: UserProfile},
          {path: "dashboard", Component: Dashboard}
        ]
      }
    ],
  },
]);

export default router;