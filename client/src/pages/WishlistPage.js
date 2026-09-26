import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
  ShoppingBag,
  RefreshCw,
  Trash2 } from
'lucide-react';
import { fetchWishlist, toggleWishlistProduct } from '../redux/wishlistSlice';
import { addToCart } from '../redux/cartSlice';
import { formatINR } from '../utils/currency';
import { getProductImage } from '../utils/productImage';

export const WishlistPage = () => {
  const dispatch = useDispatch();

  // Redux States
  const { wishlistProducts, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleWishlistRemove = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlistProduct(productId));
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: getProductImage(product),
      stock: product.stockCount,
      quantity: 1
    }));
  };

  if (!isAuthenticated) {
    return (/*#__PURE__*/
      React.createElement("div", { className: "min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-bg-secondary" }, /*#__PURE__*/
      React.createElement("div", { className: "p-5 bg-red-500/10 text-red-500 rounded-3xl mb-6 border border-red-500/10" }, /*#__PURE__*/
      React.createElement(Heart, { size: 44, className: "animate-pulse" })
      ), /*#__PURE__*/
      React.createElement("h1", { className: "text-3xl font-extrabold text-text-main tracking-tight" }, "Login Required"), /*#__PURE__*/
      React.createElement("p", { className: "text-text-muted mt-3 max-w-md font-semibold text-xs leading-relaxed" }, "Please sign in to view and manage your wishlisted items."

      ), /*#__PURE__*/
      React.createElement(Link, {
        to: "/login",
        className: "mt-8 px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-light transition-all" },
      "Sign In"

      )
      ));

  }

  if (loading) {
    return (/*#__PURE__*/
      React.createElement("div", { className: "min-h-screen flex flex-col justify-center items-center bg-bg-secondary" }, /*#__PURE__*/
      React.createElement(RefreshCw, { size: 36, className: "animate-spin text-primary mb-3" }), /*#__PURE__*/
      React.createElement("span", { className: "text-xs font-bold text-text-muted" }, "Loading your favorite items...")
      ));

  }

  return (/*#__PURE__*/
    React.createElement("div", { className: "py-12 bg-bg-secondary min-h-screen relative overflow-hidden" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute top-10 left-[-5%] w-[450px] h-[450px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" }), /*#__PURE__*/
    React.createElement("div", { className: "absolute bottom-20 right-[-5%] w-[450px] h-[450px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" }), /*#__PURE__*/

    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" }, /*#__PURE__*/


    React.createElement("div", { className: "mb-12" }, /*#__PURE__*/
    React.createElement("span", { className: "text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/15 px-3 py-1 rounded-full border border-secondary/20" }, "Saved Favorites"), /*#__PURE__*/
    React.createElement("h1", { className: "text-4xl sm:text-5xl font-extrabold tracking-tight mt-3 text-text-main" }, "My Wishlist"

    ), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted mt-3 text-base font-semibold" }, "Track and manage electrical supplies you have saved. Toggle, buy, or review items cleanly."

    )
    ),

    wishlistProducts.length === 0 ? /*#__PURE__*/
    React.createElement("div", { className: "text-center py-24 glass-card rounded-3xl border border-border/80 shadow-md" }, /*#__PURE__*/
    React.createElement(ShoppingBag, { size: 48, className: "mx-auto text-text-muted/60 mb-4" }), /*#__PURE__*/
    React.createElement("h3", { className: "text-xl font-bold text-text-main" }, "Your Wishlist is Empty"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted mt-2 text-xs font-semibold max-w-xs mx-auto leading-relaxed" }, "Explore our contractor e-store and click the heart icon on any tools or appliances to save them here!"

    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/products",
      className: "mt-8 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-light transition-all" },
    "Start Shopping ", /*#__PURE__*/
    React.createElement(ShoppingBag, { size: 14 })
    )
    ) : /*#__PURE__*/

    React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" },
    wishlistProducts.map((product) => /*#__PURE__*/
    React.createElement(motion.div, {
      key: product._id,
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      className: "glass-card bg-bg-primary rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-border/80 flex flex-col justify-between group relative" }, /*#__PURE__*/

    React.createElement(Link, { to: `/products/${product._id}`, className: "block" }, /*#__PURE__*/

    React.createElement("div", { className: "h-44 overflow-hidden relative bg-bg-secondary" }, /*#__PURE__*/
    React.createElement("img", {
      src: getProductImage(product),
      alt: product.name,
      onError: (e) => { e.target.onerror = null; e.target.src = '/images/products/wipro-smart-led-bulb.png'; },
      className: "w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" }
    ), /*#__PURE__*/
    React.createElement("span", { className: "absolute bottom-2.5 left-2.5 bg-primary/95 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow" },
    product.category
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "p-4 flex-grow flex flex-col justify-between" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between items-center gap-2 text-[9px] font-bold text-text-muted" }, /*#__PURE__*/
    React.createElement("span", null, product.brand), /*#__PURE__*/
    React.createElement("span", null, "SKU: ", product.sku.slice(0, 8))
    ), /*#__PURE__*/

    React.createElement("h4", { className: "text-xs font-extrabold text-text-main truncate mt-1 group-hover:text-primary transition-colors" },
    product.name
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex items-center gap-1.5 mt-2" }, /*#__PURE__*/
    React.createElement(Star, { size: 11, className: "fill-amber-400 text-amber-400" }), /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-extrabold text-text-main" }, product.averageRating), /*#__PURE__*/
    React.createElement("span", { className: "text-[8px] text-text-muted" }, "(", product.numReviews, ")")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "pt-3 border-t border-border/50 mt-3 flex items-center justify-between" }, /*#__PURE__*/
    React.createElement("span", { className: "text-sm font-black text-primary" },
    formatINR(product.price)
    ),
    product.stockCount <= 0 && /*#__PURE__*/
    React.createElement("span", { className: "text-[8px] font-black uppercase text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded" }, "Out of Stock"

    )

    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "p-4 pt-0 grid grid-cols-3 gap-2" }, /*#__PURE__*/
    React.createElement(Link, {
      to: `/products/${product._id}`,
      className: "col-span-1 p-2 bg-bg-secondary hover:bg-border/60 rounded-xl border border-border text-text-muted hover:text-text-main flex items-center justify-center transition-all",
      title: "View details" }, /*#__PURE__*/

    React.createElement(Eye, { size: 13 })
    ),

    product.stockCount > 0 ? /*#__PURE__*/
    React.createElement("button", {
      onClick: (e) => handleAddToCart(product, e),
      className: "col-span-1 p-2 bg-primary text-white hover:bg-primary-light rounded-xl flex items-center justify-center transition-all shadow shadow-primary/10",
      title: "Add to Cart" }, /*#__PURE__*/

    React.createElement(ShoppingCart, { size: 13 })
    ) : /*#__PURE__*/

    React.createElement("button", {
      disabled: true,
      className: "col-span-1 p-2 bg-bg-secondary text-text-muted border border-border rounded-xl cursor-not-allowed flex items-center justify-center" },
    "－"

    ), /*#__PURE__*/


    React.createElement("button", {
      onClick: (e) => handleWishlistRemove(product._id, e),
      className: "col-span-1 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl flex items-center justify-center transition-all",
      title: "Remove from Wishlist" }, /*#__PURE__*/

    React.createElement(Trash2, { size: 13 })
    )
    )
    )
    )
    )


    )
    ));

};
export default WishlistPage;