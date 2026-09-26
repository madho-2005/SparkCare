import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Star,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Award,
  ShieldAlert } from
'lucide-react';
import { fetchProductDetails, fetchProductReviews, addProductReview, clearSelectedProduct, fetchRelatedProducts } from '../redux/productSlice';
import { toggleWishlistProduct } from '../redux/wishlistSlice';
import { addToCart } from '../redux/cartSlice';
import toast from 'react-hot-toast';
import { Skeleton } from '../components/ui/Skeleton';
import { formatINR } from '../utils/currency';
import { getProductImage } from '../utils/productImage';


export const ProductDetailsPage = () => {
  const id = useParams().id;
  const dispatch = useDispatch();

  // Redux hooks
  const { selectedProduct, reviews, detailsLoading, detailsError, relatedProducts, submitReviewLoading } = useSelector((state) => state.products);
  const { wishlistedIds } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Local state
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Fetch product and reviews
  useEffect(() => {
    dispatch(fetchProductDetails(id));
    dispatch(fetchProductReviews(id));

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  // Fetch related products when the active product is loaded (isolated from main catalog state)
  useEffect(() => {
    if (selectedProduct && selectedProduct.category) {
      dispatch(fetchRelatedProducts({ category: selectedProduct.category, currentId: selectedProduct._id }));
    }
  }, [dispatch, selectedProduct?._id, selectedProduct?.category]);

  // Track product in local storage "Recently Viewed" — keyed per user to prevent cross-account leakage
  useEffect(() => {
    if (selectedProduct && selectedProduct._id === id) {
      const storageKey = `recentlyViewed_${user?._id || 'guest'}`;
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const filtered = stored.filter((item) => item._id !== selectedProduct._id);

      const newRecord = {
        _id: selectedProduct._id,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        price: selectedProduct.price,
        image: getProductImage(selectedProduct),
        category: selectedProduct.category
      };

      const updated = [newRecord, ...filtered].slice(0, 6);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  }, [selectedProduct, id, user?._id]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    dispatch(addToCart({
      product: selectedProduct._id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: getProductImage(selectedProduct),
      stock: selectedProduct.stockCount,
      quantity
    }));
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      return;
    }
    dispatch(toggleWishlistProduct(selectedProduct._id));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Review comment cannot be empty.');
      return;
    }
    dispatch(addProductReview({ productId: id, rating: reviewRating, comment: reviewComment })).
    unwrap().
    then(() => {
      toast.success('Thank you! Your review has been submitted.');
      setReviewComment('');
      setReviewRating(5);
    }).
    catch((err) => {
      toast.error(err || 'Failed to submit review. You may have already reviewed this product.');
    });
  };

  if (detailsLoading || (!selectedProduct && !detailsError)) {
    return (
      React.createElement("div", { className: "min-h-screen bg-bg-secondary py-12 relative overflow-hidden" },
      React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" },
      React.createElement(Skeleton, { variant: "rect", className: "h-10 w-36 rounded-xl mb-6" }),
      React.createElement("div", { className: "grid lg:grid-cols-2 gap-12" },
      React.createElement("div", { className: "space-y-6" },
      React.createElement(Skeleton, { variant: "rect", className: "h-[400px] rounded-3xl" }),
      React.createElement("div", { className: "grid grid-cols-3 gap-4" },
      React.createElement(Skeleton, { variant: "rect", className: "h-24 rounded-2xl" }),
      React.createElement(Skeleton, { variant: "rect", className: "h-24 rounded-2xl" }),
      React.createElement(Skeleton, { variant: "rect", className: "h-24 rounded-2xl" })
      )
      ),
      React.createElement("div", { className: "glass-card bg-bg-primary p-8 rounded-3xl border border-border space-y-6 h-[500px]" },
      React.createElement("div", { className: "flex justify-between items-center" },
      React.createElement(Skeleton, { variant: "text", className: "w-1/4 h-6" }),
      React.createElement(Skeleton, { variant: "text", className: "w-1/4 h-6" })
      ),
      React.createElement(Skeleton, { variant: "text", className: "w-3/4 h-8" }),
      React.createElement(Skeleton, { variant: "text", className: "w-1/3 h-4" }),
      React.createElement(Skeleton, { variant: "text", className: "w-full h-24 mt-6" }),
      React.createElement(Skeleton, { variant: "text", className: "w-1/2 h-8 mt-6" }),
      React.createElement("div", { className: "flex gap-4 pt-6 mt-auto" },
      React.createElement(Skeleton, { variant: "rect", className: "w-20 h-12 rounded-xl" }),
      React.createElement(Skeleton, { variant: "rect", className: "flex-grow h-12 rounded-xl" }),
      React.createElement(Skeleton, { variant: "circle", className: "w-12 h-12" })
      )
      )
      )
      )
      )
    );
  }

  if (detailsError || !selectedProduct) {
    return (
      React.createElement("div", { className: "min-h-screen bg-bg-secondary py-20 px-4" },
        React.createElement("div", { className: "max-w-md mx-auto text-center glass-card p-8 rounded-3xl border border-border shadow-lg" },
          React.createElement("h2", { className: "text-xl font-black text-text-main mb-3" }, "Product Unavailable"),
          React.createElement("p", { className: "text-text-muted text-xs font-semibold mb-6" }, detailsError || "The product you requested could not be located in our catalog."),
          React.createElement("div", { className: "flex items-center justify-center gap-3" },
            React.createElement(Link, { to: "/products", className: "px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow hover:bg-primary-light transition-all" }, "Back to Catalog"),
            React.createElement("button", { onClick: () => dispatch(fetchProductDetails(id)), className: "px-5 py-2.5 bg-bg-secondary border border-border text-text-main text-xs font-bold rounded-xl hover:bg-border/40 transition-all" }, "Retry")
          )
        )
      )
    );
  }

  const isWishlisted = wishlistedIds.includes(selectedProduct._id);
  const displayRelated = (relatedProducts || []).slice(0, 4);

  const defaultProductReviews = [
    {
      _id: 'seed_rev_1',
      user: { name: 'Anita Sharma' },
      rating: 5,
      comment: 'Outstanding quality and high performance! Very satisfied with this purchase.',
      createdAt: '2026-02-01T10:00:00Z'
    },
    {
      _id: 'seed_rev_2',
      user: { name: 'Rajesh Kumar' },
      rating: 5,
      comment: 'Super fast delivery and sturdy packaging. Works as advertised with low power draw.',
      createdAt: '2026-01-22T14:15:00Z'
    },
    {
      _id: 'seed_rev_3',
      user: { name: 'Vikram Patel' },
      rating: 4,
      comment: 'Great value for money. Easy setup and sleek modern finish.',
      createdAt: '2026-01-10T09:30:00Z'
    }
  ];

  const activeReviews = reviews.length > 0 ? reviews : defaultProductReviews;
  const totalCount = activeReviews.length;

  // Group reviews counts by stars
  const starsGroup = [5, 4, 3, 2, 1].map((starNum) => {
    const count = activeReviews.filter((r) => r.rating === starNum).length;
    const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { starNum, count, percent };
  });

  return (/*#__PURE__*/
    React.createElement("div", { className: "py-12 bg-bg-secondary min-h-screen relative overflow-hidden" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute top-0 right-[-10%] w-[450px] h-[450px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" }), /*#__PURE__*/
    React.createElement("div", { className: "absolute bottom-10 left-[-10%] w-[450px] h-[450px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" }), /*#__PURE__*/

    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" }, /*#__PURE__*/

    React.createElement("div", { className: "flex flex-wrap items-center gap-3 mb-8" }, /*#__PURE__*/
      user?.role === 'admin' && /*#__PURE__*/
      React.createElement(Link, {
        to: "/admin/products",
        className: "inline-flex items-center gap-2 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors bg-bg-primary px-3.5 py-2 rounded-xl border border-red-500/20 shadow-sm" }, /*#__PURE__*/
        React.createElement(ShieldAlert, { size: 14 }), " Back to Admin Inventory"
      ), /*#__PURE__*/
      React.createElement(Link, {
        to: "/products",
        className: "inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors bg-bg-primary px-3.5 py-2 rounded-xl border border-border/80 shadow-sm" }, /*#__PURE__*/
        React.createElement(ArrowLeft, { size: 14 }), " Back to E-Store"
      )
    ), /*#__PURE__*/


    React.createElement("div", { className: "grid lg:grid-cols-2 gap-12 mb-16" }, /*#__PURE__*/


    React.createElement("div", { className: "space-y-6" }, /*#__PURE__*/
    React.createElement("div", { className: "glass-card p-4 rounded-3xl border border-border shadow-lg bg-bg-primary overflow-hidden h-[400px] flex items-center justify-center" }, /*#__PURE__*/
    React.createElement("img", {
      src: getProductImage(selectedProduct),
      alt: selectedProduct.name,
      className: "w-full h-full object-cover rounded-2xl hover:scale-102 transition-transform duration-500",
      onError: (e) => {e.target.onerror = null;e.target.src = '/images/products/usha-ceiling-fan.png';} }
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "grid grid-cols-3 gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-4 rounded-2xl text-center" }, /*#__PURE__*/
    React.createElement(ShieldCheck, { size: 20, className: "text-green-500 mx-auto mb-2" }), /*#__PURE__*/
    React.createElement("span", { className: "block text-[10px] font-black text-text-main uppercase" }, "1 Year Warranty"), /*#__PURE__*/
    React.createElement("span", { className: "block text-[8px] text-text-muted mt-0.5" }, "SparkCare Certified")
    ), /*#__PURE__*/
    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-4 rounded-2xl text-center" }, /*#__PURE__*/
    React.createElement(Truck, { size: 20, className: "text-primary mx-auto mb-2" }), /*#__PURE__*/
    React.createElement("span", { className: "block text-[10px] font-black text-text-main uppercase" }, "Fast Delivery"), /*#__PURE__*/
    React.createElement("span", { className: "block text-[8px] text-text-muted mt-0.5" }, "Free on orders ", formatINR(100), "+")
    ), /*#__PURE__*/
    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-4 rounded-2xl text-center" }, /*#__PURE__*/
    React.createElement(Award, { size: 20, className: "text-secondary mx-auto mb-2" }), /*#__PURE__*/
    React.createElement("span", { className: "block text-[10px] font-black text-text-main uppercase" }, "UL Safety Rated"), /*#__PURE__*/
    React.createElement("span", { className: "block text-[8px] text-text-muted mt-0.5" }, "Contractor Grade")
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary p-8 rounded-3xl border border-border shadow-lg flex flex-col justify-between space-y-6" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/

    React.createElement("div", { className: "flex items-center justify-between" }, /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 uppercase tracking-widest" },
    selectedProduct.category
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-bold text-text-muted bg-bg-secondary px-2.5 py-1 rounded-md border border-border" }, "SKU: ",
    selectedProduct.sku
    )
    ), /*#__PURE__*/

    React.createElement("h1", { className: "text-2xl sm:text-3xl font-extrabold text-text-main mt-4 tracking-tight leading-tight" },
    selectedProduct.name
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-bold text-text-muted mt-1" }, "Brand: ", selectedProduct.brand), /*#__PURE__*/


    React.createElement("div", { className: "flex items-center gap-2 mt-4" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-0.5" },
    Array.from({ length: 5 }).map((_, i) => /*#__PURE__*/
    React.createElement(Star, {
      key: i,
      size: 14,
      className: `${i < Math.round(selectedProduct.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-border'}` }
    )
    )
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-xs font-extrabold text-text-main mt-0.5" }, selectedProduct.averageRating, " out of 5"), /*#__PURE__*/
    React.createElement("span", { className: "text-xs text-text-muted font-bold mt-0.5" }, "(", selectedProduct.numReviews, " ratings)")
    ), /*#__PURE__*/

    React.createElement("p", { className: "text-text-muted text-xs font-semibold mt-6 leading-relaxed" },
    selectedProduct.description
    ), /*#__PURE__*/


    React.createElement("div", { className: "mt-6 flex items-baseline gap-3" }, /*#__PURE__*/
    React.createElement("span", { className: "text-3xl font-black text-primary" }, formatINR(selectedProduct.price)),
    selectedProduct.compareAtPrice > selectedProduct.price && /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("span", { className: "text-sm font-bold text-text-muted line-through" }, formatINR(selectedProduct.compareAtPrice)), /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-black text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20" }, "SAVE ",
    Math.round((selectedProduct.compareAtPrice - selectedProduct.price) / selectedProduct.compareAtPrice * 100), "%"
    )
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "mt-4" },
    selectedProduct.stockCount > 0 ? /*#__PURE__*/
    React.createElement("span", { className: `text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm inline-block ${
      selectedProduct.stockCount <= 20 ? 'bg-amber-500 text-white animate-pulse' : 'bg-green-500/10 text-green-500 border border-green-500/20'}` },

    selectedProduct.stockCount <= 20 ? `Only ${selectedProduct.stockCount} left in stock!` : 'In Stock & Ready to Ship'
    ) : /*#__PURE__*/

    React.createElement("span", { className: "bg-red-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm inline-block" }, "Out of Stock"

    )

    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "pt-6 border-t border-border/80 space-y-6" },

    selectedProduct.specifications && selectedProduct.specifications.length > 0 && /*#__PURE__*/
    React.createElement("div", { className: "bg-bg-secondary/60 rounded-2xl p-4 border border-border" }, /*#__PURE__*/
    React.createElement("span", { className: "block text-xs font-black text-text-main uppercase mb-2" }, "Specifications"), /*#__PURE__*/
    React.createElement("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2" },
    selectedProduct.specifications.map((spec, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "flex justify-between border-b border-border/30 pb-1.5 text-xs text-text-muted" }, /*#__PURE__*/
    React.createElement("span", { className: "font-bold text-[10px] uppercase text-text-muted/80" }, spec.key), /*#__PURE__*/
    React.createElement("strong", { className: "text-text-main text-[11px]" }, spec.value)
    )
    )
    )
    ), /*#__PURE__*/



    React.createElement("div", { className: "flex flex-col sm:flex-row gap-4 items-stretch sm:items-center" },
    selectedProduct.stockCount > 0 && /*#__PURE__*/
    React.createElement("div", { className: "flex items-center border border-border bg-bg-secondary rounded-xl px-2.5 shrink-0 self-start sm:self-auto h-12" }, /*#__PURE__*/
    React.createElement("button", {
      onClick: () => setQuantity((prev) => Math.max(1, prev - 1)),
      className: "p-1 text-text-muted hover:text-text-main text-xs font-black" },
    "－"

    ), /*#__PURE__*/
    React.createElement("span", { className: "px-4 text-xs font-black text-text-main" }, quantity), /*#__PURE__*/
    React.createElement("button", {
      onClick: () => setQuantity((prev) => Math.min(selectedProduct.stockCount, prev + 1)),
      className: "p-1 text-text-muted hover:text-text-main text-xs font-black" },
    "＋"

    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex-grow flex gap-3 h-12" },
    selectedProduct.stockCount > 0 ? /*#__PURE__*/
    React.createElement("button", {
      onClick: handleAddToCart,
      className: "flex-grow bg-primary text-white hover:bg-primary-light transition-all rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-97" }, /*#__PURE__*/

    React.createElement(ShoppingCart, { size: 15 }), " Add to Cart"
    ) : /*#__PURE__*/

    React.createElement("button", {
      disabled: true,
      className: "flex-grow bg-bg-secondary text-text-muted border border-border rounded-xl font-bold text-xs cursor-not-allowed" },
    "Out of Stock"

    ), /*#__PURE__*/


    React.createElement("button", {
      onClick: handleWishlistToggle,
      className: `px-3.5 border rounded-xl flex items-center justify-center transition-all ${
      isWishlisted ?
      'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' :
      'bg-bg-secondary border-border text-text-muted hover:text-text-main hover:bg-border/30'}`,

      title: "Toggle Wishlist" }, /*#__PURE__*/

    React.createElement(Heart, { size: 16, className: isWishlisted ? 'fill-red-500' : '' })
    )
    )
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "grid lg:grid-cols-3 gap-12 mt-16 pt-12 border-t border-border/80" }, /*#__PURE__*/


    React.createElement("div", { className: "lg:col-span-1 space-y-6" }, /*#__PURE__*/
    React.createElement("h2", { className: "text-xl font-extrabold text-text-main tracking-tight" }, "Ratings & Reviews"), /*#__PURE__*/
    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm text-center" }, /*#__PURE__*/
    React.createElement("span", { className: "block text-4xl font-black text-primary" }, selectedProduct.averageRating), /*#__PURE__*/
    React.createElement("div", { className: "flex justify-center gap-0.5 mt-2" },
    Array.from({ length: 5 }).map((_, i) => /*#__PURE__*/
    React.createElement(Star, {
      key: i,
      size: 16,
      className: `${i < Math.round(selectedProduct.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-border'}` }
    )
    )
    ), /*#__PURE__*/
    React.createElement("span", { className: "block text-[11px] font-bold text-text-muted mt-2" }, "Based on ",
    reviews.length, " customer ratings"
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm space-y-3" },
    starsGroup.map(({ starNum, count, percent }) => /*#__PURE__*/
    React.createElement("div", { key: starNum, className: "flex items-center gap-3 text-xs" }, /*#__PURE__*/
    React.createElement("span", { className: "font-bold text-[10px] w-12 uppercase text-text-muted" }, starNum, " Stars"), /*#__PURE__*/
    React.createElement("div", { className: "flex-grow bg-bg-secondary rounded-full h-2 overflow-hidden border border-border/40" }, /*#__PURE__*/
    React.createElement("div", {
      className: "bg-amber-400 h-full rounded-full",
      style: { width: `${percent}%` } }
    )
    ), /*#__PURE__*/
    React.createElement("span", { className: "font-bold text-[10px] text-text-muted w-8 text-right" }, count)
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "lg:col-span-2 space-y-8" },

    isAuthenticated ? /*#__PURE__*/
    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-md" }, /*#__PURE__*/
    React.createElement("h3", { className: "text-sm font-extrabold text-text-main uppercase mb-4" }, "Write a Product Review"), /*#__PURE__*/
    React.createElement("form", { onSubmit: handleSubmitReview, className: "space-y-4" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1.5" }, "Rating Score *"), /*#__PURE__*/
    React.createElement("div", { className: "flex gap-2" },
    [1, 2, 3, 4, 5].map((starNum) => /*#__PURE__*/
    React.createElement("button", {
      key: starNum,
      type: "button",
      onClick: () => setReviewRating(starNum),
      className: "p-1 active:scale-90 transition-transform" }, /*#__PURE__*/

    React.createElement(Star, {
      size: 20,
      className: `${starNum <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-border'}` }
    )
    )
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1.5" }, "Review Comment *"), /*#__PURE__*/
    React.createElement("textarea", {
      placeholder: "Share your experience with this item. How was the build quality, packaging, and performance?",
      rows: "3",
      value: reviewComment,
      onChange: (e) => setReviewComment(e.target.value),
      className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold" }
    )
    ), /*#__PURE__*/
    React.createElement("button", {
      type: "submit",
      disabled: submitReviewLoading,
      className: "px-4.5 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50" },

    submitReviewLoading ? 'Posting Review...' : 'Submit Review'
    )
    )
    ) : /*#__PURE__*/

    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm text-center" }, /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-bold text-text-muted" }, "Please ", /*#__PURE__*/
    React.createElement(Link, { to: "/login", className: "text-primary hover:underline font-black" }, "Sign In"), " to share your product feedback."
    )
    ), /*#__PURE__*/



    React.createElement("div", { className: "space-y-4" }, /*#__PURE__*/
    React.createElement("h3", { className: "text-sm font-extrabold text-text-main uppercase" }, "Customer Reviews Feed (", activeReviews.length, ")"),

    React.createElement("div", { className: "space-y-4" },
    activeReviews.map((rev) => /*#__PURE__*/
    React.createElement(motion.div, {
      key: rev._id,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      className: "glass-card bg-bg-primary border border-border p-5 rounded-2xl shadow-sm space-y-3" }, /*#__PURE__*/

    React.createElement("div", { className: "flex items-center justify-between" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("strong", { className: "text-xs text-text-main font-bold block" }, rev.user?.name), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] text-text-muted font-medium mt-0.5" }, "Reviewed on ",
    new Date(rev.createdAt).toLocaleDateString()
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "flex gap-0.5" },
    Array.from({ length: 5 }).map((_, i) => /*#__PURE__*/
    React.createElement(Star, {
      key: i,
      size: 12,
      className: `${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}` }
    )
    )
    )
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted text-xs leading-normal font-medium" }, rev.comment)
    )
    )
    )

    )
    )
    ),


    displayRelated.length > 0 && /*#__PURE__*/
    React.createElement("div", { className: "mt-20 pt-12 border-t border-border/80 space-y-8" }, /*#__PURE__*/
    React.createElement("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-4" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("span", { className: "inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/20" }, /*#__PURE__*/
    React.createElement(Award, { size: 10 }), " Handpicked Recommendations"
    ), /*#__PURE__*/
    React.createElement("h2", { className: "text-xl sm:text-2xl font-black text-text-main uppercase tracking-tight mt-2" }, "Related Electrical Hardware"

    )
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/products",
      className: "text-[10px] font-black uppercase tracking-wider text-amber-500 hover:text-amber-600 transition-colors shrink-0" },
    "Browse Entire Catalog →"

    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-6" },
    displayRelated.map((prod) => /*#__PURE__*/
    React.createElement(motion.div, {
      key: prod._id,
      whileHover: { y: -4, transition: { duration: 0.15 } },
      className: "glass-card rounded-2xl overflow-hidden border border-border bg-bg-primary/50 flex flex-col justify-between h-[360px] group transition-all" }, /*#__PURE__*/

    React.createElement("div", { className: "h-40 overflow-hidden relative bg-bg-secondary flex items-center justify-center" }, /*#__PURE__*/
    React.createElement("img", {
      src: getProductImage(prod),
      alt: prod.name,
      className: "w-full h-full object-cover group-hover:scale-103 transition-transform duration-500",
      onError: (e) => {e.target.onerror = null;e.target.src = '/images/products/usha-ceiling-fan.png';} }
    ), /*#__PURE__*/
    React.createElement("div", { className: "absolute top-2 left-2" }, /*#__PURE__*/
    React.createElement("span", { className: "bg-bg-primary text-text-main text-[8px] font-black uppercase px-2 py-0.5 rounded border border-border shadow-sm" },
    prod.category
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "p-4 flex-grow flex flex-col justify-between gap-3" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h4", { className: "text-xs font-black text-text-main line-clamp-2 uppercase tracking-tight group-hover:text-amber-500 transition-colors" },
    prod.name
    ), /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-1 mt-1.5" }, /*#__PURE__*/
    React.createElement(Star, { size: 11, className: "fill-amber-400 text-amber-400" }), /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-black text-text-main" }, prod.averageRating || 5), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] text-text-muted" }, "(", prod.numReviews || 0, ")")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex items-center justify-between border-t border-border/40 pt-3" }, /*#__PURE__*/
    React.createElement("span", { className: "text-sm font-black text-text-main" },
    formatINR(prod.price)
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: `/products/${prod._id}`,
      className: "text-[9px] font-black uppercase bg-primary hover:bg-primary-light text-white py-2 px-3 rounded-lg shadow-sm transition-all" },
    "View Gear"

    )
    )
    )
    )
    )
    )
    )


    )
    ));

};
export default ProductDetailsPage;