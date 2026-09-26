import React from 'react';

/**
 * Reusable Button Primitive.
 * Supports flexible styling properties, size configurations, and load states.
 */
export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'btn-premium inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light border border-transparent shadow-md shadow-primary/20',
    secondary: 'bg-secondary text-white hover:bg-secondary-light border border-transparent shadow-md shadow-secondary/20',
    outline: 'border border-border bg-transparent hover:bg-bg-secondary text-text-main',
    ghost: 'bg-transparent hover:bg-bg-secondary text-text-main focus:ring-0',
    danger: 'bg-red-500 text-white hover:bg-red-600 border border-transparent shadow-md shadow-red-500/20 focus:ring-red-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base'
  };

  return (/*#__PURE__*/
    React.createElement("button", {
      type: type,
      className: `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`,
      disabled: disabled || loading,
      onClick: onClick, ...
      props },

    loading ? /*#__PURE__*/
    React.createElement("span", { className: "flex items-center gap-2" }, /*#__PURE__*/

    React.createElement("span", { className: "animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" }), /*#__PURE__*/
    React.createElement("span", null, "Processing...")
    ) :

    children

    ));

};
export default Button;