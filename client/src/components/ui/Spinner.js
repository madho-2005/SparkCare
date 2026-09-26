import React from 'react';

/**
 * Reusable Loading Spinner Component.
 * Supports customizable sizes (sm, md, lg) and tailwind configurations.
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4'
  };

  return (/*#__PURE__*/
    React.createElement("div", {
      className: `animate-spin rounded-full border-t-transparent border-primary-light ${sizes[size]} ${className}`,
      role: "status",
      "aria-label": "loading" }, /*#__PURE__*/

    React.createElement("span", { className: "sr-only" }, "Loading...")
    ));

};