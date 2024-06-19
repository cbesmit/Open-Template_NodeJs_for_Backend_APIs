import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../../layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const BlankLayout = Loadable(lazy(() => import('../../layouts/blank/BlankLayout')));

const Login = Loadable(lazy(() => import('./views/login')));

const Router = [
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
];

export default Router;
