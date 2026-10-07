import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/authSlice';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Route target: return page user wanted to view prior to login or redirect to root
  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await dispatch(loginUser({ email, password })).unwrap();
      toast.success(`Welcome back, ${response.user.name}!`);
      if (response.user?.role === 'admin' && from === '/') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err || 'Failed to authenticate');
    }
  };

  return (/*#__PURE__*/
    React.createElement("div", { className: "space-y-6" }, /*#__PURE__*/
    React.createElement("div", { className: "text-center" }, /*#__PURE__*/
    React.createElement("h2", { className: "text-2xl font-extrabold tracking-tight" }, "Sign In to Your Account"), /*#__PURE__*/
    React.createElement("p", { className: "mt-2 text-sm text-text-muted font-medium" }, "Access your bookings, purchases, and settings."

    )
    ),

    error && /*#__PURE__*/
    React.createElement("div", { className: "bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3.5 text-xs font-semibold text-center flex items-center justify-center gap-2" }, /*#__PURE__*/
    React.createElement(ShieldCheck, { size: 16 }), /*#__PURE__*/
    React.createElement("span", null, error)
    ), /*#__PURE__*/


    React.createElement("form", { className: "space-y-5", onSubmit: handleSubmit }, /*#__PURE__*/
    React.createElement(Input, {
      label: "Email Address",
      id: "email",
      type: "email",
      icon: /*#__PURE__*/React.createElement(Mail, { size: 18 }),
      placeholder: "Enter your email",
      value: email,
      onChange: (e) => setEmail(e.target.value),
      error: validationErrors.email }
    ), /*#__PURE__*/

    React.createElement(Input, {
      label: "Password",
      id: "password",
      type: "password",
      icon: /*#__PURE__*/React.createElement(Lock, { size: 18 }),
      placeholder: "••••••••",
      value: password,
      onChange: (e) => setPassword(e.target.value),
      error: validationErrors.password }
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex items-center justify-between text-xs font-bold text-primary" }, /*#__PURE__*/
    React.createElement("label", { className: "flex items-center gap-2 text-text-muted cursor-pointer" }, /*#__PURE__*/
    React.createElement("input", {
      type: "checkbox",
      className: "rounded border-border text-primary focus:ring-primary/40 bg-bg-secondary w-4 h-4" }
    ), /*#__PURE__*/
    React.createElement("span", null, "Remember Me")
    ), /*#__PURE__*/
    React.createElement(Link, { to: "/", className: "hover:text-primary-light transition-colors" }, "Forgot Password?"

    )
    ), /*#__PURE__*/

    React.createElement(Button, {
      type: "submit",
      variant: "primary",
      className: "w-full py-3",
      loading: loading },
    "Sign In"

    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "text-center text-sm text-text-muted font-semibold mt-4" }, "Don't have an account?",
    ' ', /*#__PURE__*/
    React.createElement(Link, { to: "/register", className: "text-primary hover:text-primary-light transition-colors font-bold" }, "Register Here"

    )
    ),

    React.createElement("p", { className: "text-[11px] text-text-muted text-center mt-4 leading-relaxed" },
      "By signing in, you acknowledge SparkCare's ",
      React.createElement(Link, { to: "/terms-and-conditions", className: "text-primary hover:underline font-bold" }, "Terms & Conditions"),
      " and ",
      React.createElement(Link, { to: "/privacy-policy", className: "text-primary hover:underline font-bold" }, "Privacy Policy"),
      "."
    )
    ));

};
export default LoginPage;