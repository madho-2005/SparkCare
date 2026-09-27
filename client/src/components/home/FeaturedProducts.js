import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Star, Award, ArrowRight, Eye,
  ShieldAlert, Loader2, AlertCircle, PackageSearch
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts } from '../../redux/productSlice';
import { addToCart } from '../../redux/cartSlice';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';
import { getProductImage } from '../../utils/productImage';

// Promo banner images (served from public/images)
const imgPromoLed = '/images/services/led-lighting.png';
const imgPromoPanel = '/images/services/smart-panel.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export const FeaturedProducts = () => {
  const dispatch = useDispatch();
  const {
    featuredProducts: products,
    featuredLoading: loading,
    featuredError: error,
  } = useSelector((state) => state.products);

  const loadFeatured = useCallback(() => {
    const promise = dispatch(fetchFeaturedProducts({ limit: 6, sort: 'rating' }));
    return () => {
      promise.abort();
    };
  }, [dispatch]);

  useEffect(() => {
    const cleanup = loadFeatured();
    return () => {
      if (cleanup) cleanup();
    };
  }, [loadFeatured]);

  const handleRetry = () => {
    dispatch(fetchFeaturedProducts({ limit: 6, sort: 'rating' }));
  };

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        product: product._id,          // Real MongoDB ObjectId
        name: product.name,
        price: product.price,
        image: getProductImage(product),
        stock: product.stockCount,
        quantity: 1,
      })
    );
    toast.success(`${product.name} added to cart!`);
  };

  // ── Loading State ────────────────────────────────────────────────────────────
  const renderLoading = () =>
    React.createElement(
      'div',
      { className: 'flex flex-col items-center justify-center py-20 gap-4' },
      React.createElement(Loader2, { size: 36, className: 'text-amber-500 animate-spin' }),
      React.createElement(
        'p',
        { className: 'text-text-muted text-sm font-semibold' },
        'Loading featured products...'
      )
    );

  // ── Error State ──────────────────────────────────────────────────────────────
  const renderError = () =>
    React.createElement(
      'div',
      { className: 'flex flex-col items-center justify-center py-20 gap-4 text-center' },
      React.createElement(AlertCircle, { size: 36, className: 'text-red-500' }),
      React.createElement(
        'p',
        { className: 'text-text-muted text-sm font-semibold max-w-sm' },
        error
      ),
      React.createElement(
        'button',
        {
          onClick: handleRetry,
          className:
            'text-xs font-black uppercase tracking-wider text-amber-500 hover:text-amber-600 transition-colors border border-amber-500/30 px-4 py-2 rounded-lg hover:bg-amber-500/10 cursor-pointer active:scale-95',
        },
        'Try Again'
      )
    );

  // ── Empty State ──────────────────────────────────────────────────────────────
  const renderEmpty = () =>
    React.createElement(
      'div',
      { className: 'flex flex-col items-center justify-center py-20 gap-4 text-center' },
      React.createElement(PackageSearch, { size: 36, className: 'text-text-muted' }),
      React.createElement(
        'p',
        { className: 'text-text-muted text-sm font-semibold' },
        'No featured products available right now.'
      ),
      React.createElement(
        Link,
        {
          to: '/products',
          className:
            'text-xs font-black uppercase tracking-wider text-amber-500 hover:text-amber-600 transition-colors',
        },
        'Browse All Products →'
      )
    );

  // ── Product Card ─────────────────────────────────────────────────────────────
  const renderCard = (product) =>
    React.createElement(
      motion.div,
      {
        key: String(product._id),
        variants: itemVariants,
        whileHover: { y: -6, transition: { duration: 0.2 } },
        className:
          'glass-card rounded-2xl overflow-hidden shadow-lg border border-border bg-bg-primary/50 flex flex-col justify-between h-[525px] group transition-all',
      },

      // Card image area
      React.createElement(
        'div',
        { className: 'h-52 overflow-hidden relative' },

        // Product image — with broken-image fallback
        React.createElement('img', {
          src: getProductImage(product),
          alt: product.name,
          className: 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500',
          onError: (e) => {
            e.target.onerror = null;
            e.target.src = '/images/products/wipro-smart-led-bulb.png';
          },
        }),

        // Category badge
        React.createElement(
          'div',
          { className: 'absolute top-4 left-4' },
          React.createElement(
            'span',
            {
              className:
                'bg-bg-primary text-text-main text-[9px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-md border border-border shadow-sm',
            },
            product.category
          )
        ),

        // Low stock badge
        product.stockCount <= 10 &&
          React.createElement(
            'div',
            {
              className:
                'absolute top-4 right-4 flex items-center gap-1 bg-red-500/90 text-white text-[9px] font-black uppercase px-2 py-1.5 rounded-md shadow-md animate-pulse',
            },
            React.createElement(ShieldAlert, { size: 10 }),
            ' Low Stock'
          ),

        // Eye overlay → real product detail page using MongoDB _id
        React.createElement(
          'div',
          {
            className:
              'absolute inset-0 bg-amber-500/10 backdrop-blur-xxs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          },
          React.createElement(
            Link,
            {
              to: `/products/${product._id}`,
              className:
                'p-3.5 bg-bg-primary text-amber-500 hover:text-amber-600 rounded-full shadow-lg transition-transform duration-200 hover:scale-110',
              title: 'View product details',
            },
            React.createElement(Eye, { size: 18 })
          )
        )
      ),

      // Card body
      React.createElement(
        'div',
        { className: 'p-6 flex-grow flex flex-col justify-between gap-4' },

        React.createElement(
          'div',
          { className: 'flex flex-col gap-2' },

          // SKU + spec row
          React.createElement(
            'div',
            {
              className:
                'flex justify-between text-[9px] font-black text-text-muted uppercase tracking-wider',
            },
            React.createElement('span', null, 'SKU: ', product.sku),
            React.createElement(
              'span',
              { className: 'text-amber-500' },
              product.specifications?.[1]?.value || product.brand || ''
            )
          ),

          // Product name
          React.createElement(
            'h3',
            {
              className:
                'text-base font-black text-text-main line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors uppercase tracking-tight',
            },
            product.name
          ),

          // Description
          React.createElement(
            'p',
            { className: 'text-xs text-text-muted font-semibold line-clamp-3 leading-relaxed mt-1' },
            product.description
          )
        ),

        // Rating + price row
        React.createElement(
          'div',
          { className: 'border-t border-border/60 pt-4 flex items-center justify-between' },

          React.createElement(
            'div',
            { className: 'flex items-center gap-1' },
            React.createElement(Star, { size: 14, className: 'fill-amber-400 text-amber-400' }),
            React.createElement(
              'span',
              { className: 'text-xs font-black text-text-main mt-0.5' },
              product.averageRating || '0'
            ),
            React.createElement(
              'span',
              { className: 'text-[9px] text-text-muted mt-0.5' },
              '(',
              product.numReviews || 0,
              ' Reviews)'
            )
          ),

          React.createElement(
            'span',
            { className: 'text-lg font-black text-text-main' },
            formatINR(product.price)
          )
        )
      ),

      // Add to Cart button — dispatches real MongoDB product._id
      React.createElement(
        'div',
        { className: 'px-6 pb-6 pt-0' },
        React.createElement(
          'button',
          {
            onClick: () => handleAddToCart(product),
            className:
              'w-full py-3.5 bg-primary hover:bg-primary-light text-white transition-all text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-primary/10 cursor-pointer active:scale-95',
          },
          React.createElement(ShoppingCart, { size: 14 }),
          ' Add to Cart'
        )
      )
    );

  // ── Full Section ─────────────────────────────────────────────────────────────
  return React.createElement(
    'section',
    { className: 'py-20 bg-bg-primary relative overflow-hidden' },

    // Ambient background blobs
    React.createElement('div', {
      className:
        'absolute top-10 right-[-10%] w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none',
    }),
    React.createElement('div', {
      className:
        'absolute bottom-10 left-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px] pointer-events-none',
    }),

    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10' },

      // ── Promo Banner ──────────────────────────────────────────────────────────
      React.createElement(
        motion.div,
        {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.5 },
          className:
            'glass-card rounded-3xl overflow-hidden border border-border mb-14 flex flex-col lg:flex-row',
        },

        // Left text panel
        React.createElement(
          'div',
          { className: 'flex-1 p-8 sm:p-12 flex flex-col justify-center gap-6' },

          React.createElement(
            'div',
            {
              className:
                'inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest w-fit border border-amber-500/20',
            },
            React.createElement(Award, { size: 11 }),
            ' SparkCare E-Store'
          ),

          React.createElement(
            'div',
            null,
            React.createElement(
              'h2',
              { className: 'text-3xl sm:text-4xl font-black text-text-main leading-tight' },
              'Premium',
              React.createElement(
                'span',
                {
                  className:
                    'block bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent',
                },
                'Home Shop'
              )
            ),
            React.createElement(
              'p',
              { className: 'text-text-muted mt-4 text-sm font-medium leading-relaxed max-w-sm' },
              'Source certified, top-tier electrical goods directly. LED light panels, contractor-grade wires, smart thermostats, and accessories.'
            )
          ),

          React.createElement(
            'div',
            { className: 'flex flex-wrap gap-2' },
            ['LED Panels', 'Contractor Wires', 'Smart Thermostats', 'Accessories'].map((tag) =>
              React.createElement(
                'span',
                {
                  key: tag,
                  className:
                    'text-[10px] font-bold px-3 py-1 rounded-full bg-bg-secondary border border-border text-text-muted',
                },
                tag
              )
            )
          ),

          React.createElement(
            Link,
            {
              to: '/products',
              className:
                'inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95 w-fit',
            },
            'Shop Now ',
            React.createElement(ArrowRight, { size: 13 })
          )
        ),

        // Right image panel
        React.createElement(
          'div',
          { className: 'lg:w-[420px] shrink-0 p-4 flex gap-3 items-center' },
          React.createElement(
            'div',
            { className: 'flex-1 h-64 lg:h-full rounded-2xl overflow-hidden' },
            React.createElement('img', {
              src: imgPromoLed,
              alt: 'LED lighting products',
              className: 'w-full h-full object-cover hover:scale-105 transition-transform duration-500',
            })
          ),
          React.createElement(
            'div',
            { className: 'flex-1 h-64 lg:h-full rounded-2xl overflow-hidden' },
            React.createElement('img', {
              src: imgPromoPanel,
              alt: 'Smart electrical panel',
              className: 'w-full h-full object-cover hover:scale-105 transition-transform duration-500',
            })
          )
        )
      ),

      // ── Section Header ────────────────────────────────────────────────────────
      React.createElement(
        'div',
        { className: 'flex items-center justify-between mb-10' },

        React.createElement(
          'div',
          {
            className:
              'inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-amber-500/20',
          },
          React.createElement(Award, { size: 12 }),
          ' Top Quality Gear & Parts'
        ),

        React.createElement(
          Link,
          {
            to: '/products',
            className:
              'inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 hover:text-amber-600 transition-colors group',
          },
          'View All ',
          React.createElement(ArrowRight, { size: 13, className: 'transition-transform group-hover:translate-x-1' })
        )
      ),

      // ── Product Grid / States ─────────────────────────────────────────────────
      loading
        ? renderLoading()
        : error
        ? renderError()
        : products.length === 0
        ? renderEmpty()
        : React.createElement(
            motion.div,
            {
              variants: containerVariants,
              initial: 'hidden',
              whileInView: 'visible',
              viewport: { once: true, margin: '-100px' },
              className: 'grid sm:grid-cols-2 lg:grid-cols-3 gap-8',
            },
            products.map((product) => renderCard(product))
          )
    )
  );
};

export default FeaturedProducts;