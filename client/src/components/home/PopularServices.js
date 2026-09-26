import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, ShieldAlert, Zap, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../utils/currency';

/* ─── Service card design tokens ─────────────────────────────────────────────
   Clean, modern, theme-aware styling.
   - Light mode → Pure crisp white card, slate-900 text, slate-600 descriptions, subtle border.
   - Dark mode  → Deep slate/navy card (#0f172a), white text, soft gray descriptions.
   - Image      → 100% clean image with zero heavy gradients, natural edge meeting card body.
──────────────────────────────────────────────────────────────────────────── */
const SERVICE_CARD_STYLES = `
  /* ── Light theme — crisp, modern, premium white surface ── */
  :root {
    --sc-card-bg:           #ffffff;
    --sc-card-bg-hover:     #ffffff;
    --sc-card-border:       rgba(226, 232, 240, 0.95);
    --sc-card-border-hover: rgba(59, 130, 246, 0.45);
    --sc-card-shadow:       0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.03);
    --sc-card-shadow-hover: 0 10px 30px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04);
    --sc-title-color:       #0f172a;
    --sc-title-hover:       #2563eb;
    --sc-category-color:    #2563eb;
    --sc-desc-color:        #475569;
    --sc-price-label:       #94a3b8;
    --sc-price-color:       #0f172a;
    --sc-duration-color:    #64748b;
    --sc-divider:           #f1f5f9;
    --sc-icon-bg:           rgba(255, 255, 255, 0.96);
    --sc-icon-border:       rgba(226, 232, 240, 0.9);
    --sc-icon-shadow:       0 2px 8px rgba(15, 23, 42, 0.08);
  }

  /* ── Dark theme — deep navy/charcoal surface ── */
  [data-theme="dark"] {
    --sc-card-bg:           #0f172a;
    --sc-card-bg-hover:     #131d33;
    --sc-card-border:       rgba(255, 255, 255, 0.08);
    --sc-card-border-hover: rgba(99, 102, 241, 0.45);
    --sc-card-shadow:       0 1px 4px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.2);
    --sc-card-shadow-hover: 0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.3);
    --sc-title-color:       #f8fafc;
    --sc-title-hover:       #60a5fa;
    --sc-category-color:    #60a5fa;
    --sc-desc-color:        #94a3b8;
    --sc-price-label:       #64748b;
    --sc-price-color:       #f8fafc;
    --sc-duration-color:    #94a3b8;
    --sc-divider:           rgba(255, 255, 255, 0.08);
    --sc-icon-bg:           rgba(15, 23, 42, 0.88);
    --sc-icon-border:       rgba(255, 255, 255, 0.1);
    --sc-icon-shadow:       0 2px 8px rgba(0, 0, 0, 0.4);
  }

  /* ── Base card ─────────────────────────────────────── */
  .sc-card {
    display: flex;
    flex-direction: column;
    background: var(--sc-card-bg);
    border: 1px solid var(--sc-card-border);
    border-radius: 20px;
    box-shadow: var(--sc-card-shadow);
    overflow: hidden;
    transition: transform 250ms ease, box-shadow 250ms ease,
                border-color 250ms ease, background-color 250ms ease;
    will-change: transform;
    height: 100%;
    width: 100%;
  }
  .sc-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--sc-card-shadow-hover);
    border-color: var(--sc-card-border-hover);
    background-color: var(--sc-card-bg-hover);
  }

  /* ── Image wrapper — clean, sharp, natural edge ───── */
  .sc-image-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10.5;
    overflow: hidden;
    flex-shrink: 0;
    background-color: #e2e8f0;
  }
  [data-theme="dark"] .sc-image-wrap {
    background-color: #1e293b;
  }
  .sc-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 320ms ease;
  }
  .sc-card:hover .sc-image {
    transform: scale(1.03);
  }

  /* ── Subtle top accent line on hover ───────────────── */
  .sc-accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #6366f1);
    opacity: 0;
    transition: opacity 250ms ease;
    z-index: 10;
  }
  .sc-card:hover .sc-accent-bar {
    opacity: 1;
  }

  /* ── Refined pill badge ────────────────────────────── */
  .sc-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 9999px;
    padding: 4px 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    line-height: 1;
    z-index: 5;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }
  .sc-badge-amber {
    background: rgba(254, 243, 199, 0.95);
    color: #92400e;
    border: 1px solid rgba(245, 158, 11, 0.35);
  }
  .sc-badge-red {
    background: rgba(254, 226, 226, 0.95);
    color: #991b1b;
    border: 1px solid rgba(239, 68, 68, 0.35);
  }
  .sc-badge-blue {
    background: rgba(219, 234, 254, 0.95);
    color: #1e40af;
    border: 1px solid rgba(59, 130, 246, 0.35);
  }

  [data-theme="dark"] .sc-badge-amber {
    background: rgba(245, 158, 11, 0.16);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }
  [data-theme="dark"] .sc-badge-red {
    background: rgba(239, 68, 68, 0.16);
    color: #f87171;
    border: 1px solid rgba(248, 113, 113, 0.3);
  }
  [data-theme="dark"] .sc-badge-blue {
    background: rgba(59, 130, 246, 0.16);
    color: #93c5fd;
    border: 1px solid rgba(147, 197, 253, 0.3);
  }

  /* ── Service icon at bottom-right of image ─────────── */
  .sc-icon-wrap {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sc-icon-bg);
    border: 1px solid var(--sc-icon-border);
    box-shadow: var(--sc-icon-shadow);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: transform 250ms ease, box-shadow 250ms ease;
    z-index: 5;
  }
  .sc-card:hover .sc-icon-wrap {
    transform: scale(1.06);
  }
  .sc-icon-amber { color: #d97706; }
  .sc-icon-red   { color: #dc2626; }
  .sc-icon-blue  { color: #2563eb; }
  [data-theme="dark"] .sc-icon-amber { color: #fbbf24; }
  [data-theme="dark"] .sc-icon-red   { color: #f87171; }
  [data-theme="dark"] .sc-icon-blue  { color: #60a5fa; }

  /* ── Card body ─────────────────────────────────────── */
  .sc-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 20px 20px 18px;
  }

  /* ── Category label ────────────────────────────────── */
  .sc-category {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sc-category-color);
    margin: 0 0 6px 0;
    line-height: 1;
  }

  /* ── Service title ─────────────────────────────────── */
  .sc-title {
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    font-weight: 800;
    color: var(--sc-title-color);
    line-height: 1.35;
    margin: 0 0 8px 0;
    transition: color 200ms ease;
    letter-spacing: -0.01em;
    min-height: 44px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .sc-card:hover .sc-title {
    color: var(--sc-title-hover);
  }

  /* ── Description ───────────────────────────────────── */
  .sc-desc {
    font-size: 12.5px;
    font-weight: 400;
    color: var(--sc-desc-color);
    line-height: 1.6;
    flex: 1;
    margin: 0 0 16px 0;
    min-height: 58px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Divider ───────────────────────────────────────── */
  .sc-divider {
    height: 1px;
    background: var(--sc-divider);
    margin: 0 0 14px 0;
    border: none;
    display: block;
  }

  /* ── Footer: price + CTA ───────────────────────────── */
  .sc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
  }

  /* ── Price block ───────────────────────────────────── */
  .sc-price-label {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sc-price-label);
    display: block;
    margin-bottom: 2px;
    line-height: 1;
  }
  .sc-price {
    font-size: 19px;
    font-weight: 800;
    color: var(--sc-price-color);
    line-height: 1.1;
    letter-spacing: -0.02em;
    display: block;
  }
  .sc-duration {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10.5px;
    font-weight: 500;
    color: var(--sc-duration-color);
    margin-top: 3px;
  }

  /* ── Book Now button ───────────────────────────────── */
  .sc-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #2563eb;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 10px 16px;
    border-radius: 11px;
    text-decoration: none;
    transition: background-color 200ms ease, transform 150ms ease, box-shadow 200ms ease;
    white-space: nowrap;
    flex-shrink: 0;
    line-height: 1;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
  }
  .sc-btn:hover {
    background: #1d4ed8;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    transform: translateY(-1px);
  }
  .sc-btn:active {
    transform: scale(0.97);
  }
  .sc-btn:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }

  /* ── Responsive grid ───────────────────────────────── */
  .sc-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    align-items: stretch;
  }
  @media (min-width: 640px) {
    .sc-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }
  @media (min-width: 1024px) {
    .sc-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
  }

  /* ── Motion wrapper must stretch to full height ────── */
  .sc-motion-wrap {
    height: 100%;
    display: flex;
  }
`;

// Color class helpers
const getBadgeClass = (color) => {
  if (color === 'red') return 'sc-badge sc-badge-red';
  if (color === 'blue') return 'sc-badge sc-badge-blue';
  return 'sc-badge sc-badge-amber';
};
const getIconClass = (color) => {
  if (color === 'red') return 'sc-icon-wrap sc-icon-red';
  if (color === 'blue') return 'sc-icon-wrap sc-icon-blue';
  return 'sc-icon-wrap sc-icon-amber';
};

// Clock SVG inline
const ClockSVG = /*#__PURE__*/React.createElement('svg', {
  width: 11,
  height: 11,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2.5',
  style: { flexShrink: 0 },
  'aria-hidden': 'true',
},
  /*#__PURE__*/React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
  /*#__PURE__*/React.createElement('polyline', { points: '12 6 12 12 16 14' })
);

// Service photos (served from public/images/services)
const imgSmartPanel   = '/images/services/smart-panel.png';
const imgWiringRepair = '/images/services/wiring-repair.png';
const imgEvCharger    = '/images/services/ev-charger.png';
const imgLedLighting  = '/images/services/led-lighting.png';

export const PopularServices = () => {
  const services = [
    {
      id: 'srv_1',
      title: 'Smart Panel Upgrade',
      description: 'Replace old fuse boxes with modern breakers to keep your home safe and support heavy appliances.',
      price: 499,
      duration: '3–4 hours',
      category: 'Installation',
      badge: 'Best Seller',
      icon: ShieldCheck,
      color: 'amber',
      photo: imgSmartPanel,
    },
    {
      id: 'srv_2',
      title: 'Emergency Outage Repair',
      description: 'Fast response to fix flickering lights, overloaded outlets, and power outages.',
      price: 99,
      duration: '1–2 hours',
      category: 'Repair',
      badge: 'Fast Arrival',
      icon: ShieldAlert,
      color: 'red',
      photo: imgWiringRepair,
    },
    {
      id: 'srv_3',
      title: 'EV Fast Charger Installation',
      description: 'High-voltage wiring to charge your electric car quickly and safely at home.',
      price: 299,
      duration: '2 hours',
      category: 'Charging',
      badge: 'Trending',
      icon: Zap,
      color: 'blue',
      photo: imgEvCharger,
    },
    {
      id: 'srv_4',
      title: 'Ceiling Fan & Custom Lighting',
      description: 'Professional installation of ceiling fans, chandeliers, and dimmers you can control with an app.',
      price: 120,
      duration: '1.5 hours',
      category: 'Automation',
      badge: 'Popular',
      icon: Sparkles,
      color: 'amber',
      photo: imgLedLighting,
    },
  ];

  const headingVariants = {
    hidden:  { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const cardVariants = {
    hidden:  { opacity: 0, y: 24 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.42, ease: 'easeOut' },
    }),
  };

  return (/*#__PURE__*/
    React.createElement(React.Fragment, null,

    // Scoped design-token stylesheet
    /*#__PURE__*/React.createElement('style', null, SERVICE_CARD_STYLES),

    /*#__PURE__*/React.createElement('section', { className: 'py-20 bg-bg-secondary/40 border-y border-border/40 relative' },
    /*#__PURE__*/React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },

    // ── Section heading ──────────────────────────────────
    /*#__PURE__*/React.createElement(motion.div, {
      initial: 'hidden',
      whileInView: 'visible',
      viewport: { once: true, margin: '-100px' },
      variants: headingVariants,
      className: 'text-center max-w-3xl mx-auto mb-14',
    },
      /*#__PURE__*/React.createElement('div', {
        className: 'inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-amber-500/20',
      },
        /*#__PURE__*/React.createElement(Wrench, { size: 12 }),
        ' Trusted Local Services'
      ),
      /*#__PURE__*/React.createElement('h2', { className: 'text-3xl sm:text-4xl font-black text-text-main font-heading' },
        'Our Popular ',
        /*#__PURE__*/React.createElement('span', {
          className: 'bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent',
        }, 'Electrical Services')
      ),
      /*#__PURE__*/React.createElement('p', { className: 'text-text-muted mt-4 font-medium text-sm leading-relaxed' },
        'Book licensed local electricians with simple upfront pricing and guaranteed safe work.'
      )
    ),

    // ── Cards grid ───────────────────────────────────────
    /*#__PURE__*/React.createElement('div', { className: 'sc-grid' },

      services.map((service, index) => {
        const IconComponent = service.icon;
        return (/*#__PURE__*/
          React.createElement(motion.div, {
            key: service.id,
            custom: index,
            initial: 'hidden',
            whileInView: 'visible',
            viewport: { once: true, margin: '-50px' },
            variants: cardVariants,
            className: 'sc-motion-wrap',
          },

          // ─── Card shell ───────────────────────────────
          /*#__PURE__*/React.createElement('div', { className: 'sc-card' },

          // ─── Image area — full clean image, zero bottom fade ─
          /*#__PURE__*/React.createElement('div', { className: 'sc-image-wrap' },
            /*#__PURE__*/React.createElement('img', {
              src: service.photo,
              alt: service.title + ' — SparkCare electrician service',
              className: 'sc-image',
            }),
            // Top accent bar (visible on hover)
            /*#__PURE__*/React.createElement('div', { className: 'sc-accent-bar', 'aria-hidden': 'true' }),
            // Badge — top left
            /*#__PURE__*/React.createElement('span', { className: getBadgeClass(service.color) },
              service.badge
            ),
            // Icon — bottom right
            /*#__PURE__*/React.createElement('div', {
              className: getIconClass(service.color),
              'aria-hidden': 'true',
            },
              /*#__PURE__*/React.createElement(IconComponent, { size: 17, strokeWidth: 2.2 })
            )
          ),

          // ─── Card body ────────────────────────────────
          /*#__PURE__*/React.createElement('div', { className: 'sc-body' },

            // Category
            /*#__PURE__*/React.createElement('p', { className: 'sc-category' }, service.category),

            // Title
            /*#__PURE__*/React.createElement('h3', { className: 'sc-title' }, service.title),

            // Description
            /*#__PURE__*/React.createElement('p', { className: 'sc-desc' }, service.description),

            // Divider
            /*#__PURE__*/React.createElement('hr', { className: 'sc-divider' }),

            // Footer: price + CTA
            /*#__PURE__*/React.createElement('div', { className: 'sc-footer' },

              // Price block
              /*#__PURE__*/React.createElement('div', null,
                /*#__PURE__*/React.createElement('span', { className: 'sc-price-label' }, 'Upfront price'),
                /*#__PURE__*/React.createElement('span', { className: 'sc-price' }, formatINR(service.price)),
                /*#__PURE__*/React.createElement('span', { className: 'sc-duration' },
                  ClockSVG,
                  service.duration
                )
              ),

              // Book Now button
              /*#__PURE__*/React.createElement(Link, {
                to: '/services',
                className: 'sc-btn',
                'aria-label': 'Book ' + service.title,
              },
                'Book Now',
                /*#__PURE__*/React.createElement(ArrowRight, { size: 12, strokeWidth: 2.5, 'aria-hidden': 'true' })
              )
            )
          )

          ) // end sc-card
          ) // end motion.div
        );
      })
    ),

    // ── See all link ─────────────────────────────────────
    /*#__PURE__*/React.createElement('div', { className: 'text-center mt-12' },
      /*#__PURE__*/React.createElement(Link, {
        to: '/services',
        className: 'inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500 hover:text-amber-600 transition-colors group',
      },
        'See All Electrical Services',
        /*#__PURE__*/React.createElement(ArrowRight, {
          size: 14,
          className: 'transition-transform group-hover:translate-x-1',
          'aria-hidden': 'true',
        })
      )
    )

    ) // end max-w-7xl
    ) // end section
    ) // end Fragment
  );
};

export default PopularServices;