import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../../layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../../layouts/blank/BlankLayout')));

/* ****Pages***** */
const Error = Loadable(lazy(() => import('../../views/authentication/Error')));


// Modulos 
// Login
const Login = Loadable(lazy(() => import('./views/home')));


const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/home" /> },
      { path: '/home', exact: true, element: <Login /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
  {
    path: '/404',
    element: <BlankLayout />,
    children: [
      { path: '', element: <Navigate to="/404/error" /> },
      { path: 'error', element: <Error /> },
      { path: '*', element: <Navigate to="/404/error" /> },
    ],
  },

];

export default Router;
