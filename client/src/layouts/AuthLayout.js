import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export const AuthLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // If already authenticated, bypass login/signup views entirely
  if (isAuthenticated) {
    return /*#__PURE__*/React.createElement(Navigate, { to: "/", replace: true });
  }

  return (/*#__PURE__*/
    React.createElement("div", { className: "min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bg-secondary relative overflow-hidden transition-colors duration-300" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" }), /*#__PURE__*/
    React.createElement("div", { className: "absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[150px] pointer-events-none" }), /*#__PURE__*/

    React.createElement("div", { className: "sm:mx-auto sm:w-full sm:max-w-md z-10 text-center" }, /*#__PURE__*/
    React.createElement(Link, { to: "/", className: "inline-block mb-6" }, /*#__PURE__*/
    React.createElement("span", { className: "text-3xl font-extrabold font-heading tracking-tight text-primary" }, "Spark", /*#__PURE__*/
    React.createElement("span", { className: "text-secondary" }, "Care")
    )
    )
    ), /*#__PURE__*/


    React.createElement(motion.div, {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: 'easeOut' },
      className: "mt-2 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4" }, /*#__PURE__*/

    React.createElement("div", { className: "glass-card py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-bg-primary/5" }, /*#__PURE__*/
    React.createElement(Outlet, null)
    )
    )
    ));

};
export default AuthLayout;