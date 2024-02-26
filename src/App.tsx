import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/home/Home";
import CarDetail from "./pages/car/CarDetail";
import Dashboard from "./pages/dashboard/Dashboard";
import New from "./pages/dashboard/new/New";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Private from "./routes/Private";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/car/:id',
        element: <CarDetail />
      },
      {
        path: '/dashboard',
        element: <Private><Dashboard /></Private>
      },
      {
        path: '/dashboard/new',
        element: <Private><New /></Private>
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
])

export { router };