import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// Layout Imports
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Route Guard
import { ProtectedRoute } from './ProtectedRoute';

// Public Page Imports
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ServicesPage } from '../pages/ServicesPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { UserAccountPage } from '../pages/UserAccountPage.js';

// Legal & Information Page Imports
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { TermsConditionsPage } from '../pages/TermsConditionsPage';
import { RefundCancellationPage } from '../pages/RefundCancellationPage';
import { ShippingDeliveryPage } from '../pages/ShippingDeliveryPage';
import { ContactUsPage } from '../pages/ContactUsPage';
import { AboutUsPage } from '../pages/AboutUsPage';

// Admin Page Imports
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminBookings } from '../pages/AdminBookings';
import { AdminProducts } from '../pages/AdminProducts';
import { AdminServices } from '../pages/AdminServices';
import { AdminUsers } from '../pages/AdminUsers';
import { AdminOrders } from '../pages/AdminOrders';
import { AdminCoupons } from '../pages/AdminCoupons';
import { AdminSettings } from '../pages/AdminSettings';
import { AdminPayments } from '../pages/AdminPayments';
import { AdminReviews } from '../pages/AdminReviews';
import { AdminReports } from '../pages/AdminReports';

/**
 * Reusable animated page wrapper component for smooth page transitions
 */
const PageTransition = ({ children }) => /*#__PURE__*/
React.createElement(motion.div, {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.35, ease: 'easeOut' },
  className: "w-full" },

children
);


/**
 * Premium 404 Not Found fallback view
 */
const NotFoundPage = () => /*#__PURE__*/
React.createElement("div", { className: "min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-bg-secondary transition-colors duration-300" }, /*#__PURE__*/
React.createElement("div", { className: "p-5 bg-red-500/10 text-red-500 rounded-3xl mb-6 border border-red-500/10 animate-bounce" }, /*#__PURE__*/
React.createElement(ShieldAlert, { size: 48 })
), /*#__PURE__*/
React.createElement("h1", { className: "text-4xl font-extrabold tracking-tight" }, "Component/Route Not Found"), /*#__PURE__*/
React.createElement("p", { className: "text-text-muted mt-3 max-w-md font-semibold text-sm" }, "The coordinates you requested do not map to active platform components or you lack authorized credentials."

), /*#__PURE__*/
React.createElement(Link, {
  to: "/",
  className: "mt-8 px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-light transition-all" },
"Back to Home"

)
);


export const AppRoutes = () => {
  return (/*#__PURE__*/
    React.createElement(Routes, null, /*#__PURE__*/


    React.createElement(Route, { element: /*#__PURE__*/React.createElement(MainLayout, null) }, /*#__PURE__*/
    React.createElement(Route, { path: "/", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(LandingPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/services", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(ServicesPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/products", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(ProductsPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/products/:id", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(ProductDetailsPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/cart", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(CartPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/privacy-policy", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(PrivacyPolicyPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/terms-and-conditions", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(TermsConditionsPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/refund-and-cancellation", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(RefundCancellationPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/shipping-and-delivery", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(ShippingDeliveryPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/contact-us", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(ContactUsPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/about-us", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AboutUsPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "*", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(NotFoundPage, null)) })
    ), /*#__PURE__*/


    React.createElement(Route, { element: /*#__PURE__*/React.createElement(AuthLayout, null) }, /*#__PURE__*/
    React.createElement(Route, { path: "/login", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(LoginPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/register", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(RegisterPage, null)) })
    ), /*#__PURE__*/


    React.createElement(Route, { element: /*#__PURE__*/React.createElement(ProtectedRoute, { allowedRoles: ['user', 'admin'] }) }, /*#__PURE__*/
    React.createElement(Route, { element: /*#__PURE__*/React.createElement(MainLayout, null) }, /*#__PURE__*/
    React.createElement(Route, { path: "/wishlist", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(WishlistPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/checkout", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(CheckoutPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/account", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(UserAccountPage, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/profile", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(UserAccountPage, null)) })
    )
    ), /*#__PURE__*/


    React.createElement(Route, { element: /*#__PURE__*/React.createElement(ProtectedRoute, { allowedRoles: ['admin'] }) }, /*#__PURE__*/
    React.createElement(Route, { element: /*#__PURE__*/React.createElement(DashboardLayout, null) }, /*#__PURE__*/
    React.createElement(Route, { path: "/admin", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminDashboard, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/bookings", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminBookings, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/products", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminProducts, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/services", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminServices, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/users", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminUsers, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/orders", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminOrders, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/coupons", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminCoupons, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/settings", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminSettings, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/payments", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminPayments, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/reviews", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminReviews, null)) }), /*#__PURE__*/
    React.createElement(Route, { path: "/admin/reports", element: /*#__PURE__*/React.createElement(PageTransition, null, /*#__PURE__*/React.createElement(AdminReports, null)) })
    )
    )

    ));

};

export default AppRoutes;