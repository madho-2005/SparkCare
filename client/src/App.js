import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';
import { checkAuthStatus } from './redux/authSlice';
import { AppRoutes } from './routes/AppRoutes';
import { Spinner } from './components/ui/Spinner';
import { Toaster } from 'react-hot-toast';

// A helper wrapper component to inject thunks within Provider context
const AppWrapper = () => {
  const dispatch = useDispatch();
  const { isInitialized, loading } = useSelector((state) => state.auth);
  useEffect(() => {
    // Check authentication status & active session on boot without forcing route redirects
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Center screen loader while active cookies check resolves
  if (!isInitialized && loading) {
    return (/*#__PURE__*/
      React.createElement("div", { className: "min-h-screen w-full flex flex-col items-center justify-center bg-bg-primary text-text-main transition-colors duration-300" }, /*#__PURE__*/
      React.createElement("div", { className: "space-y-4 flex flex-col items-center" }, /*#__PURE__*/
      React.createElement(Spinner, { size: "lg" }), /*#__PURE__*/
      React.createElement("p", { className: "text-xs font-black uppercase tracking-wider text-text-muted animate-pulse" }, "Authenticating SparkCare Session..."

      )
      )
      ));

  }

  return (/*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(AppRoutes, null), /*#__PURE__*/


    React.createElement(Toaster, {
      position: "top-right",
      toastOptions: {
        className: 'glass-card border border-border text-text-main text-xs font-bold py-3.5 px-4.5 rounded-xl shadow-xl',
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#0ea5e9',
            secondary: '#ffffff'
          }
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff'
          }
        }
      } }
    )
    ));

};

export const App = () => {
  return (/*#__PURE__*/
    React.createElement(Provider, { store: store }, /*#__PURE__*/
    React.createElement(BrowserRouter, null, /*#__PURE__*/
    React.createElement(AppWrapper, null)
    )
    ));

};

export default App;