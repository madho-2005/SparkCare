import React from 'react';

/**
 * Highly customized glassmorphic shimmer boxes to act as placeholding assets for cards, lists, tables, and buttons.
 */
export const Skeleton = ({ className = '', variant = 'rect', ...props }) => {
  const baseClasses = 'animate-pulse bg-text-main/10 rounded';

  let variantClasses;
  switch (variant) {
    case 'circle':
      variantClasses = 'rounded-full';
      break;
    case 'text':
      variantClasses = 'h-4 w-full';
      break;
    case 'rect':
    default:
      variantClasses = 'w-full h-32';
      break;
  }

  return /*#__PURE__*/React.createElement("div", { className: `${baseClasses} ${variantClasses} ${className}`, ...props });
};

/**
 * E-commerce listing card shimmer skeleton preset
 */
Skeleton.Card = () => {
  return (/*#__PURE__*/
    React.createElement("div", { className: "glass-card border border-border bg-bg-primary p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between h-full" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-3" }, /*#__PURE__*/
    React.createElement(Skeleton, { variant: "rect", className: "h-44 rounded-xl" }), /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between items-center" }, /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-1/3 h-3" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-1/4 h-3" })
    ), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-4/5 h-5 font-bold" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-full h-8" })
    ), /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between items-center pt-2" }, /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-1/3 h-6" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "circle", className: "w-10 h-10" })
    )
    ));

};

/**
 * Dashboard tabular grid row shimmer preset
 */
Skeleton.Table = ({ rows = 5, cols = 5 }) => {
  return (/*#__PURE__*/
    React.createElement("div", { className: "w-full space-y-4" }, /*#__PURE__*/
    React.createElement("div", { className: "flex space-x-4 border-b border-border pb-3" },
    Array.from({ length: cols }).map((_, i) => /*#__PURE__*/
    React.createElement(Skeleton, { key: i, variant: "text", className: `h-4 ${i === 0 ? 'w-1/3' : 'w-1/6'}` })
    )
    ),
    Array.from({ length: rows }).map((_, rowIndex) => /*#__PURE__*/
    React.createElement("div", { key: rowIndex, className: "flex space-x-4 py-3 border-b border-border/40" },
    Array.from({ length: cols }).map((_, colIndex) => /*#__PURE__*/
    React.createElement(Skeleton, {
      key: colIndex,
      variant: "text",
      className: `h-4 ${colIndex === 0 ? 'w-1/4' : colIndex === 1 ? 'w-1/3' : 'w-1/8'}` }
    )
    )
    )
    )
    ));

};

/**
 * Text block shimmer skeleton preset
 */
Skeleton.TextBlock = () => {
  return (/*#__PURE__*/
    React.createElement("div", { className: "space-y-2.5" }, /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-1/3 h-6 mb-4" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-full h-4" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-11/12 h-4" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-4/5 h-4" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-3/4 h-4" })
    ));

};

export default Skeleton;