import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable dynamic Input Primitive.
 * Features built-in styling, custom icon embeds, password toggle button, error status, and helper tags.
 */
export const Input = /*#__PURE__*/forwardRef(({
  label,
  type = 'text',
  error,
  icon,
  rightIcon,
  className = '',
  id,
  placeholder,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === 'password';
  const inputType = isPasswordInput ? showPassword ? 'text' : 'password' : type;

  return (/*#__PURE__*/
    React.createElement("div", { className: `w-full flex flex-col gap-1.5 ${className}` },
    label && /*#__PURE__*/
    React.createElement("label", { htmlFor: id, className: "text-xs font-bold uppercase tracking-wider text-text-muted" },
    label
    ), /*#__PURE__*/

    React.createElement("div", { className: "relative rounded-xl shadow-sm" },
    icon && /*#__PURE__*/
    React.createElement("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted" },
    icon
    ), /*#__PURE__*/

    React.createElement("input", {
      id: id,
      type: inputType,
      ref: ref,
      placeholder: placeholder,
      className: `block w-full rounded-xl bg-bg-secondary border font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-text-muted/60 ${
      icon ? 'pl-11' : 'pl-4'} ${

      isPasswordInput || rightIcon ? 'pr-11' : 'pr-4'} ${

      error ?
      'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-500/5' :
      'border-border focus:ring-primary/40 focus:border-primary bg-bg-primary'} py-3 text-text-main`, ...

      props }
    ),
    isPasswordInput && /*#__PURE__*/
    React.createElement("button", {
      type: "button",
      onClick: () => setShowPassword((prev) => !prev),
      className: "absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-main transition-colors focus:outline-none cursor-pointer",
      tabIndex: -1,
      title: showPassword ? 'Hide Password' : 'Show Password',
      "aria-label": showPassword ? 'Hide Password' : 'Show Password' },

    showPassword ? /*#__PURE__*/React.createElement(EyeOff, { size: 18 }) : /*#__PURE__*/React.createElement(Eye, { size: 18 })
    ),

    !isPasswordInput && rightIcon && /*#__PURE__*/
    React.createElement("div", { className: "absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-text-muted" },
    rightIcon
    )

    ),
    error && /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-semibold text-red-500 mt-0.5", id: `${id}-error` },
    error
    )

    ));

});

Input.displayName = 'Input';
export default Input;