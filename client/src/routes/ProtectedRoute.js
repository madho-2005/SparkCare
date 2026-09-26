import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner } from '../components/ui/Spinner';

/**
 * Route Security Guard.
 * Locks down component pages using dynamic Redux authentication states and role criteria.
 * 
 * @param {Array<String>} allowedRoles - Permitted roles (user, admin)
 */
export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, isInitialized, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show a full-screen loading spinner while initial session checking executes
  if (!isInitialized && loading) {
    return (/*#__PURE__*/
      React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-bg-primary text-primary" }, /*#__PURE__*/
      React.createElement(Spinner, { size: "lg" })
      ));

  }

  // Redirect to signin view if unauthorized, caching location to return upon successful login
  if (!isAuthenticated) {
    return /*#__PURE__*/React.createElement(Navigate, { to: "/login", state: { from: location }, replace: true });
  }

  // Redirect to root if user role doesn't have privileges
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return /*#__PURE__*/React.createElement(Navigate, { to: "/", replace: true });
  }

  // Authorized: render nested child router elements
  return /*#__PURE__*/React.createElement(Outlet, null);
};