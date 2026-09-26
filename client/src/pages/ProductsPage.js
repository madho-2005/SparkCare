import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { formatINR } from '../utils/currency';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Star,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Heart,
  ChevronLeft,
  ChevronRight,
  Building2,
  Eye,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { fetchProducts, fetchCategories } from '../redux/productSlice';
import { fetchWishlist, toggleWishlistProduct } from '../redux/wishlistSlice';
import { addToCart } from '../redux/cartSlice';
import toast from 'react-hot-toast';
import { Skeleton } from '../components/ui/Skeleton';
import { getProductImage } from '../utils/productImage';

const DEFAULT_CATEGORIES = [
  'All',
  'LED Lights',
  'Wires & Cables',
  'Ceiling Fans',
  'Smart Devices',
  'Switches',
  'Extension Boards',
  'Electrical Safety Products'
];

const FAMOUS_BRANDS = [
  'All Brands',
  'Philips',
  'Havells',
  'Wipro',
  'Usha',
  'Polycab',
  'Finolex',
  'Bajaj',
  'Syska',
  'Anchor',
  'RR Kabel',
  'Crompton',
  'Orient',
  'SmartLife',
  'Legrand',
  'Schneider',
  'V-Guard'
];

export const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux States
  const { products, totalPages, loading, error, categories: reduxCategories } = useSelector((state) => state.products);
  const { wishlistedIds } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Local UI States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [localBrand, setLocalBrand] = useState('All Brands');
  const selectedBrand = searchParams.has('brand') ? (searchParams.get('brand') || 'All Brands') : localBrand;
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  // Dynamic Categories list from API + defaults
  const categoriesList = React.useMemo(() => {
    if (reduxCategories && reduxCategories.length > 0) {
      const set = new Set(['All', ...reduxCategories]);
      return Array.from(set);
    }
    return DEFAULT_CATEGORIES;
  }, [reduxCategories]);

  // Safe deduplication based on stable database _id
  const uniqueProducts = React.useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return Array.from(
      new Map(
        products
          .filter((p) => p && p._id)
          .map((p) => [String(p._id), p])
      ).values()
    );
  }, [products]);

  // Recently viewed — namespaced per user to prevent cross-account leakage
  const [recentlyViewed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`recentlyViewed_${user?._id || 'guest'}`) || '[]');
    } catch {
      return [];
    }
  });

  // Select cart items from Redux store for count badge
  const cartItems = useSelector((state) => state.cart.items || []);
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  // Fetch categories once on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Sync Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load products based on query state
  const loadCatalog = useCallback(() => {
    const params = {
      page,
      limit: 6,
      sort: sortBy,
    };

    if (selectedCategory && selectedCategory !== 'All') {
      params.category = selectedCategory;
    }

    if (selectedBrand && selectedBrand !== 'All Brands') {
      params.brand = selectedBrand;
    }

    if (debouncedSearch && debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (minPrice && !isNaN(Number(minPrice)) && Number(minPrice) >= 0) {
      params.minPrice = (parseFloat(minPrice) / 83).toString();
    }

    if (maxPrice && !isNaN(Number(maxPrice)) && Number(maxPrice) >= 0) {
      params.maxPrice = (parseFloat(maxPrice) / 83).toString();
    }

    dispatch(fetchProducts(params));
  }, [dispatch, page, sortBy, selectedCategory, selectedBrand, debouncedSearch, minPrice, maxPrice]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Load wishlist if logged in
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Handlers
  const handleBrandSelect = (brandName) => {
    setLocalBrand(brandName);
    setPage(1);
    if (brandName && brandName !== 'All Brands') {
      setSearchParams({ brand: brandName });
    } else {
      setSearchParams({});
    }
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    setPage(1);
  };

  const handleAddToCart = (product) => {
    if (!product) return;
    dispatch(addToCart({
      product: product._id,
      name: product.name || 'SparkCare Product',
      price: product.price || 0,
      image: getProductImage(product),
      stock: product.stockCount || 0,
      quantity: 1
    }));
  };

  const handleWishlistToggle = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      return;
    }
    dispatch(toggleWishlistProduct(productId));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setLocalBrand('All Brands');
    setSearchParams({});
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
    toast.success('All catalog filters reset!');
  };

  const handleRetry = () => {
    loadCatalog();
  };

  return (
    React.createElement("div", { className: "py-12 bg-bg-secondary min-h-screen relative overflow-hidden" },
      React.createElement("div", { className: "absolute top-10 left-[-5%] w-[450px] h-[450px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" }),
      React.createElement("div", { className: "absolute bottom-20 right-[-5%] w-[450px] h-[450px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" }),
      React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" },
        // Header
        React.createElement("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6" },
          React.createElement("div", { className: "max-w-2xl" },
            React.createElement("span", { className: "text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20" }, "SparkCare E-Store"),
            React.createElement("h1", { className: "text-4xl sm:text-5xl font-extrabold tracking-tight mt-3 text-text-main" }, "Premium Home Shop"),
            React.createElement("p", { className: "text-text-muted mt-3 text-base font-semibold" }, "Source certified, top-tier electrical goods directly. LED light panels, contractor-grade wires, smart thermostats, and accessories.")
          ),
          React.createElement("div", { className: "glass-card bg-bg-primary py-3 px-5 rounded-2xl shadow-lg border border-border/80 flex items-center gap-3 self-stretch md:self-auto justify-between" },
            React.createElement("div", { className: "flex items-center gap-3" },
              React.createElement("div", { className: "relative p-2.5 bg-primary/15 text-primary rounded-xl" },
                React.createElement(ShoppingCart, { size: 20 }),
                cartCount > 0 && React.createElement("span", { className: "absolute top-[-3px] right-[-3px] w-5.5 h-5.5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md" }, cartCount)
              ),
              React.createElement("div", { className: "text-xs" },
                React.createElement("p", { className: "font-bold text-text-muted" }, "Dynamic Cart"),
                React.createElement("p", { className: "text-sm font-black text-text-main mt-0.5" }, `${cartCount} Items Loaded`)
              )
            )
          )
        ),

        // Main 4-column Grid Container
        React.createElement("div", { className: "grid lg:grid-cols-4 gap-8" },
          // Child 1 of Grid: Sidebar (lg:col-span-1)
          React.createElement("div", { className: "lg:col-span-1 space-y-6" },
            React.createElement("div", { className: "glass-card p-6 rounded-2xl border border-border shadow-md sticky top-24" },
              React.createElement("div", { className: "flex items-center justify-between pb-4 border-b border-border/60 mb-6" },
                React.createElement("span", { className: "flex items-center gap-2 font-extrabold text-sm text-text-main" },
                  React.createElement(Filter, { size: 16, className: "text-primary" }), " Filter Options"
                ),
                React.createElement("button", { onClick: handleClearFilters, className: "text-[10px] font-bold text-secondary hover:underline cursor-pointer" }, "Reset All")
              ),
              React.createElement("div", { className: "mb-6" },
                React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-2" }, "Search Catalog"),
                React.createElement("div", { className: "relative" },
                  React.createElement("span", { className: "absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted pointer-events-none" }, React.createElement(Search, { size: 14 })),
                  React.createElement("input", { type: "text", placeholder: "Search e.g. Philips, Wire...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-bg-secondary text-text-main text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all font-semibold" })
                )
              ),
              React.createElement("div", { className: "mb-6" },
                React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-2" }, "Price Interval (₹)"),
                React.createElement("div", { className: "flex items-center gap-2" },
                  React.createElement("input", { type: "number", min: "0", placeholder: "Min ₹", value: minPrice, onChange: (e) => { setMinPrice(e.target.value); setPage(1); }, className: "w-full bg-bg-secondary text-text-main text-xs px-3 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold" }),
                  React.createElement("span", { className: "text-text-muted text-xs font-bold" }, "-"),
                  React.createElement("input", { type: "number", min: "0", placeholder: "Max ₹", value: maxPrice, onChange: (e) => { setMaxPrice(e.target.value); setPage(1); }, className: "w-full bg-bg-secondary text-text-main text-xs px-3 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold" })
                )
              ),
              React.createElement("div", { className: "mb-6" },
                React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-2 flex items-center gap-1.5" },
                  React.createElement(Building2, { size: 13, className: "text-primary" }), " Famous Brands / Company"
                ),
                React.createElement("div", { className: "flex flex-wrap gap-1.5" },
                  FAMOUS_BRANDS.map((b) =>
                    React.createElement("button", { key: b, onClick: () => handleBrandSelect(b), className: `px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${selectedBrand === b ? 'bg-primary text-white border-primary shadow-sm' : 'bg-bg-secondary text-text-muted hover:text-text-main border-border hover:border-primary/40'}` }, b)
                  )
                )
              ),
              React.createElement("div", { className: "mb-6" },
                React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-2" }, "Category"),
                React.createElement("div", { className: "space-y-2" },
                  categoriesList.map((cat) =>
                    React.createElement("button", { key: cat, onClick: () => handleCategorySelect(cat), className: `w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${selectedCategory === cat ? 'bg-primary/10 text-primary border-primary/20 shadow-sm' : 'bg-transparent text-text-muted hover:text-text-main border-transparent hover:bg-bg-secondary'}` },
                      React.createElement("span", null, cat),
                      selectedCategory === cat && React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-primary" })
                    )
                  )
                )
              ),
              React.createElement("div", { className: "mb-2" },
                React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-2 flex items-center gap-1.5" },
                  React.createElement(ArrowUpDown, { size: 13, className: "text-primary" }), " Sort Results"
                ),
                React.createElement("div", { className: "flex items-center gap-2 bg-bg-secondary border border-border px-3 py-2.5 rounded-xl hover:border-primary/40 transition-colors mb-3" },
                  React.createElement(ArrowUpDown, { size: 14, className: "text-primary" }),
                  React.createElement("select", { value: sortBy, onChange: (e) => { setSortBy(e.target.value); setPage(1); }, className: "w-full bg-transparent text-xs font-extrabold focus:outline-none text-text-main border-none cursor-pointer" },
                    React.createElement("option", { value: "newest", className: "bg-bg-primary text-text-main font-bold py-1" }, "⚡ Newest Arrivals"),
                    React.createElement("option", { value: "price_asc", className: "bg-bg-primary text-text-main font-bold py-1" }, "🏷️ Price: Low to High"),
                    React.createElement("option", { value: "price_desc", className: "bg-bg-primary text-text-main font-bold py-1" }, "💎 Price: High to Low"),
                    React.createElement("option", { value: "rating", className: "bg-bg-primary text-text-main font-bold py-1" }, "⭐ Top Rated")
                  )
                ),
                React.createElement("div", { className: "grid grid-cols-2 gap-1.5" },
                  [
                    { label: '⚡ Newest', val: 'newest' },
                    { label: '🏷️ Price Low', val: 'price_asc' },
                    { label: '💎 Price High', val: 'price_desc' },
                    { label: '⭐ Top Rated', val: 'rating' }
                  ].map((item) =>
                    React.createElement("button", { key: item.val, onClick: () => { setSortBy(item.val); setPage(1); }, className: `py-1.5 px-2 rounded-lg text-[10px] font-black transition-all border text-center cursor-pointer ${sortBy === item.val ? 'bg-primary text-white border-primary shadow-sm' : 'bg-bg-secondary text-text-muted hover:text-text-main border-border/80 hover:border-primary/40'}` }, item.label)
                  )
                )
              )
            )
          ), // END OF lg:col-span-1 SIDEBAR

          // Child 2 of Grid: Main Content (lg:col-span-3)
          React.createElement("div", { className: "lg:col-span-3 space-y-6" },
            // Active Brand Indicator
            selectedBrand && selectedBrand !== 'All Brands' && React.createElement("div", { className: "flex items-center justify-between bg-primary/10 border border-primary/20 p-3.5 rounded-2xl" },
              React.createElement("span", { className: "text-xs font-bold text-primary flex items-center gap-2" },
                React.createElement(Building2, { size: 16 }), " Filtering by Company: ", React.createElement("strong", { className: "font-black underline" }, selectedBrand)
              ),
              React.createElement("button", { onClick: () => handleBrandSelect('All Brands'), className: "text-[10px] font-extrabold bg-primary text-white px-2.5 py-1 rounded-full hover:bg-primary-light transition-colors cursor-pointer" }, "Show All Companies")
            ),

            // STATE 1: LOADING SKELETONS
            loading ? (
              React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" },
                Array.from({ length: 6 }).map((_, i) => React.createElement(Skeleton.Card, { key: i }))
              )
            ) :

            // STATE 2: API / NETWORK ERROR WITH RETRY
            error ? (
              React.createElement("div", { className: "text-center py-16 px-4 glass-card bg-bg-primary rounded-2xl border border-red-500/30 shadow-md space-y-4" },
                React.createElement(AlertTriangle, { size: 48, className: "mx-auto text-red-500" }),
                React.createElement("h3", { className: "text-lg font-bold text-text-main" }, "Unable to Load Products"),
                React.createElement("p", { className: "text-text-muted text-xs font-semibold max-w-md mx-auto leading-relaxed" }, typeof error === 'string' ? error : "There was an unexpected connection error. Please check backend availability and try again."),
                React.createElement("div", { className: "flex items-center justify-center gap-3 pt-2" },
                  React.createElement("button", { onClick: handleRetry, className: "px-5 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer" },
                    React.createElement(RefreshCw, { size: 14 }), " Retry Now"
                  ),
                  React.createElement("button", { onClick: handleClearFilters, className: "px-4 py-2.5 bg-bg-secondary border border-border text-text-muted hover:text-text-main text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5" },
                    React.createElement(XCircle, { size: 14 }), " Reset Filters"
                  )
                )
              )
            ) :

            // STATE 3: GENUINE EMPTY SEARCH/FILTER RESULTS
            uniqueProducts.length === 0 ? (
              React.createElement("div", { className: "text-center py-20 glass-card bg-bg-primary rounded-2xl border border-border shadow-sm space-y-4" },
                React.createElement(AlertTriangle, { size: 44, className: "mx-auto text-secondary" }),
                React.createElement("h3", { className: "text-lg font-bold text-text-main" }, "No Products Matched"),
                React.createElement("p", { className: "text-text-muted text-xs font-medium max-w-sm mx-auto leading-relaxed" }, "We couldn't locate any matching contractor-grade supplies with your current filter criteria."),
                React.createElement("button", { onClick: handleClearFilters, className: "px-5 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer" }, "Clear All Filters")
              )
            ) :

            // STATE 4: SUCCESS - RENDER PRODUCT CARDS & PAGINATION
            React.createElement(React.Fragment, null,
              React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" },
                uniqueProducts.map((product) => {
                  const isWishlisted = wishlistedIds.includes(product._id);
                  const title = product.name || 'Electrical Product';
                  const brand = product.brand || 'SparkCare';
                  const category = product.category || 'General';
                  const price = product.price || 0;
                  const compareAtPrice = product.compareAtPrice || 0;
                  const stockCount = typeof product.stockCount === 'number' ? product.stockCount : 10;
                  const sku = product.sku || 'SKU-GEN';
                  const rating = product.averageRating || 4.5;
                  const reviewsCount = product.numReviews || 0;
                  const description = product.description || 'Quality electrical supply item.';

                  return React.createElement(motion.div, { key: product._id, layout: true, initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 }, className: "glass-card bg-bg-primary rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-border flex flex-col justify-between group relative" },
                    React.createElement("button", { onClick: (e) => handleWishlistToggle(product._id, e), className: "absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/70 hover:bg-white backdrop-blur-md shadow-md text-text-muted hover:text-red-500 transition-all active:scale-90 cursor-pointer", title: isWishlisted ? 'Remove from wishlist' : 'Add to wishlist' },
                      React.createElement(Heart, { size: 16, className: `${isWishlisted ? 'fill-red-500 text-red-500' : 'text-text-muted'}` })
                    ),
                    React.createElement(Link, { to: `/products/${product._id}`, className: "block" },
                      React.createElement("div", { className: "h-48 overflow-hidden relative bg-bg-secondary" },
                        React.createElement("img", { src: getProductImage(product), alt: title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", onError: (e) => { e.target.onerror = null; e.target.src = '/images/products/wipro-smart-led-bulb.png'; } }),
                        React.createElement("span", { className: "absolute bottom-3 left-3 bg-primary/90 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-md whitespace-nowrap max-w-[140px] truncate" }, category),
                        compareAtPrice > price && React.createElement("span", { className: "absolute top-3 left-3 bg-secondary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow" }, "SAVE ", Math.round(((compareAtPrice - price) / compareAtPrice) * 100), "%")
                      ),
                      React.createElement("div", { className: "p-5 flex-grow flex flex-col justify-between" },
                        React.createElement("div", null,
                          React.createElement("div", { className: "flex items-center justify-between gap-2" },
                            React.createElement("button", { type: "button", onClick: (e) => { e.preventDefault(); e.stopPropagation(); handleBrandSelect(brand); }, className: "text-[10px] font-extrabold text-primary hover:underline cursor-pointer bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 transition-all hover:bg-primary/20 whitespace-nowrap truncate max-w-[130px] inline-block" }, "Brand: ", brand),
                            stockCount > 0 && stockCount <= 5 ? React.createElement("span", { className: "text-[9px] font-black bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-0.5" }, React.createElement("span", { className: "w-1 h-1 rounded-full bg-amber-500" }), " Only ", stockCount, " left!") : React.createElement("span", { className: "text-[9px] font-bold bg-bg-secondary border border-border px-1.5 py-0.5 rounded text-text-muted" }, "SKU: ", sku.slice(0, 10))
                          ),
                          React.createElement("h3", { className: "text-sm font-extrabold text-text-main tracking-tight group-hover:text-primary transition-colors mt-2 line-clamp-1" }, title),
                          React.createElement("p", { className: "text-text-muted text-[11px] font-semibold mt-2.5 line-clamp-2 leading-normal" }, description)
                        ),
                        React.createElement("div", { className: "pt-4 mt-4 border-t border-border/60 flex items-center justify-between" },
                          React.createElement("div", null,
                            React.createElement("span", { className: "text-xs text-text-muted block font-medium" }, "Price"),
                            React.createElement("span", { className: "text-lg font-black text-text-main" }, formatINR(price))
                          ),
                          React.createElement("div", { className: "flex items-center gap-1 bg-amber-500/10 text-amber-500 font-extrabold text-xs px-2 py-1 rounded-md border border-amber-500/20" },
                            React.createElement(Star, { size: 12, className: "fill-amber-400 text-amber-400" }), " ", rating, " (", reviewsCount, ")"
                          )
                        )
                      )
                    ),
                    React.createElement("div", { className: "p-5 pt-0 flex gap-2" },
                      React.createElement(Link, { to: `/products/${product._id}`, className: "p-2.5 bg-bg-secondary hover:bg-border/50 rounded-xl border border-border text-text-muted hover:text-text-main transition-all flex items-center justify-center", title: "View details" }, React.createElement(Eye, { size: 14 })),
                      stockCount > 0 ? React.createElement("button", { onClick: () => handleAddToCart(product), className: "flex-grow py-2.5 bg-primary text-white hover:bg-primary-light transition-all text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer active:scale-95" }, React.createElement(ShoppingCart, { size: 13 }), " Add to Cart") : React.createElement("button", { disabled: true, className: "flex-grow py-2.5 bg-bg-secondary text-text-muted border border-border text-xs font-bold rounded-xl cursor-not-allowed" }, "Out of Stock")
                    )
                  );
                })
              ),
              totalPages > 1 && React.createElement("div", { className: "flex items-center justify-center gap-2 pt-6" },
                React.createElement("button", { onClick: () => setPage((prev) => Math.max(1, prev - 1)), disabled: page === 1, className: "p-2 bg-bg-primary hover:bg-bg-secondary text-text-muted hover:text-text-main border border-border rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" }, React.createElement(ChevronLeft, { size: 16 })),
                Array.from({ length: totalPages }).map((_, idx) => {
                  const pageVal = idx + 1;
                  return React.createElement("button", { key: pageVal, onClick: () => setPage(pageVal), className: `w-9.5 h-9.5 flex items-center justify-center text-xs font-black rounded-xl border transition-all cursor-pointer ${page === pageVal ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' : 'bg-bg-primary text-text-muted hover:text-text-main border-border'}` }, pageVal);
                }),
                React.createElement("button", { onClick: () => setPage((prev) => Math.min(totalPages, prev + 1)), disabled: page === totalPages, className: "p-2 bg-bg-primary hover:bg-bg-secondary text-text-muted hover:text-text-main border border-border rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" }, React.createElement(ChevronRight, { size: 16 }))
              )
            )
          ) // END OF lg:col-span-3 CONTENT
        ), // END OF MAIN GRID

        // Recently Viewed
        recentlyViewed.length > 0 && React.createElement("div", { className: "mt-20 pt-12 border-t border-border/80" },
          React.createElement("div", { className: "flex items-center gap-2 mb-8" },
            React.createElement("div", { className: "p-1 bg-secondary/15 text-secondary rounded-lg" }, React.createElement(Eye, { size: 16 })),
            React.createElement("h2", { className: "text-xl font-extrabold text-text-main tracking-tight" }, "Recently Viewed Products")
          ),
          React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-6" },
            recentlyViewed.slice(0, 4).map((p) =>
              React.createElement(Link, { key: p._id, to: `/products/${p._id}`, className: "glass-card bg-bg-primary rounded-xl border border-border/70 p-3 hover:shadow-md transition-all flex items-center gap-4 group" },
                React.createElement("img", { src: getProductImage(p), alt: p.name || 'Item', onError: (e) => { e.target.onerror = null; e.target.src = '/images/products/wipro-smart-led-bulb.png'; }, className: "w-16 h-16 rounded-lg object-cover bg-bg-secondary flex-shrink-0" }),
                React.createElement("div", { className: "min-w-0 flex-grow" },
                  React.createElement("div", { className: "flex items-center gap-1 text-[9px] font-bold text-text-muted uppercase" }, React.createElement("span", { className: "text-primary font-black" }, p.brand || p.category || 'SparkCare')),
                  React.createElement("h4", { className: "text-xs font-bold text-text-main truncate group-hover:text-primary transition-colors mt-0.5" }, p.name || 'Product'),
                  React.createElement("p", { className: "text-sm font-black text-text-main mt-1" }, formatINR(p.price || 0))
                )
              )
            )
          )
        )
      ) // END OF CONTAINER
    ) // END OF ROOT
  );
};

export default ProductsPage;