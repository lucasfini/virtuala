import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Account from './components/Account';
import SignIn from './components/SignIn';
import SignOut from './components/SignOut';
import Error from './components/Error';
import reportWebVitals from './reportWebVitals';
import Dashboard from './components/Dashboard';

import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/tool/:conversionId",
    element: <App />,
    errorElement: <Error />
  },
  {
    path: "/tool",
    element: <App />,
    errorElement: <Error />
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    errorElement: <Error />
  },
  {
    path: "/login",
    element: <SignIn />,
    errorElement: <Error />
  },
  {
    path: "/account",
    element: <Account />,
    errorElement: <Error />
  },
  {
    path: "/support",
    element: <div>Support</div>,
    errorElement: <Error />
  },
  {
    path: "/signout",
    element: <SignOut />,
    errorElement: <Error />
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 
    <RouterProvider router={router} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
