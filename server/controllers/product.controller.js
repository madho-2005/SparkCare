import { Product } from '../models/Product.js';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';
import { notificationService } from '../services/notificationService.js';
import mongoose from 'mongoose';

// High-fidelity seed products for SparkCare catalog
const SEED_PRODUCTS = [
  // 1. Smart LED Lights
  {
    name: 'Wipro Smart LED Bulb',
    description: 'Wi-Fi enabled smart color-changing LED bulb compatible with Alexa and Google Assistant. Choose from 16 million colors.',
    price: 15.99,
    compareAtPrice: 22.00,
    sku: 'WIPRO-SMART-LED',
    category: 'LED Lights',
    brand: 'Wipro',
    stockCount: 95,
    images: [
      {
        secure_url: '/images/products/wipro-smart-led-bulb.png',
        public_id: 'seed/wipro_smart_bulb'
      }
    ],
    specifications: [
      { key: 'Wattage', value: '12W' },
      { key: 'Connectivity', value: 'Wi-Fi + Bluetooth' },
      { key: 'Colors', value: '16 Million RGB' }
    ],
    averageRating: 4.7,
    numReviews: 68,
    isFeatured: true
  },
  {
    name: 'Philips 9W LED Bulb',
    description: 'Energy-efficient 9W LED light bulb offering bright cool day light. Fits standard B22d fixtures with high longevity.',
    price: 3.99,
    compareAtPrice: 5.99,
    sku: 'PHILIPS-9W-LED',
    category: 'LED Lights',
    brand: 'Philips',
    stockCount: 150,
    images: [
      {
        secure_url: '/images/products/philips-9w-led-bulb.png',
        public_id: 'seed/philips_9w_led'
      }
    ],
    specifications: [
      { key: 'Wattage', value: '9W' },
      { key: 'Brightness', value: '900 Lumens' },
      { key: 'Base Type', value: 'B22d' }
    ],
    averageRating: 4.6,
    numReviews: 45,
    isFeatured: true
  },
  {
    name: 'Havells LED Panel Light',
    description: 'Sleek round recessed LED panel light. Modern ultra-slim trim style providing smooth glare-free downlighting.',
    price: 12.50,
    compareAtPrice: 16.00,
    sku: 'HAVELLS-LED-PANEL',
    category: 'LED Lights',
    brand: 'Havells',
    stockCount: 80,
    images: [
      {
        secure_url: '/images/products/havells-led-panel-light.png',
        public_id: 'seed/havells_led_panel'
      }
    ],
    specifications: [
      { key: 'Wattage', value: '15W' },
      { key: 'Cutout Size', value: '6 Inches' },
      { key: 'Shape', value: 'Round' }
    ],
    averageRating: 4.4,
    numReviews: 22,
    isFeatured: false
  },
  {
    name: 'Bajaj Emergency LED Light',
    description: 'Inbuilt rechargeable battery emergency LED bulb. Automatically turns on during power cuts with up to 4 hours backup.',
    price: 7.99,
    compareAtPrice: 10.50,
    sku: 'BAJAJ-EMER-LED',
    category: 'LED Lights',
    brand: 'Bajaj',
    stockCount: 3,
    images: [
      {
        secure_url: '/images/products/bajaj-emergency-led-light.png',
        public_id: 'seed/bajaj_emergency_bulb'
      }
    ],
    specifications: [
      { key: 'Battery', value: '2200mAh Li-ion' },
      { key: 'Backup Time', value: '4 Hours' },
      { key: 'Auto On', value: 'Yes' }
    ],
    averageRating: 4.3,
    numReviews: 14,
    isFeatured: false
  },
  {
    name: 'Syska Tube Light',
    description: 'Bright and highly efficient 4-feet linear LED tube light. Robust casing with anti-glare diffuser for wide-angle spread.',
    price: 6.50,
    compareAtPrice: 8.99,
    sku: 'SYSKA-T5-TUBE',
    category: 'LED Lights',
    brand: 'Syska',
    stockCount: 110,
    images: [
      {
        secure_url: '/images/products/syska-tube-light.png',
        public_id: 'seed/syska_tube_light'
      }
    ],
    specifications: [
      { key: 'Length', value: '4 Feet' },
      { key: 'Wattage', value: '20W' },
      { key: 'Light Color', value: 'Cool Day Light' }
    ],
    averageRating: 4.5,
    numReviews: 31,
    isFeatured: false
  },

  // 2. Wires & Cables
  {
    name: 'Polycab Copper Wire',
    description: 'High-purity single-core copper conductor building wire. Flame-retardant casing makes it ideal for residential conduit wiring.',
    price: 64.99,
    compareAtPrice: 79.99,
    sku: 'POLYCAB-CU-15',
    category: 'Wires & Cables',
    brand: 'Polycab',
    stockCount: 60,
    images: [
      {
        secure_url: '/images/products/polycab-copper-wire.png',
        public_id: 'seed/polycab_copper_wire'
      }
    ],
    specifications: [
      { key: 'Gauge', value: '1.5 sq mm' },
      { key: 'Length', value: '90 Meters' },
      { key: 'Fire Rating', value: 'Flame Retardant (FR)' }
    ],
    averageRating: 4.8,
    numReviews: 53,
    isFeatured: true
  },
  {
    name: 'Finolex Electrical Cable',
    description: 'Contractor-grade building wire with copper conductors for dry internal applications. High current carrying capability and durable PVC sheath.',
    price: 98.00,
    compareAtPrice: 115.00,
    sku: 'FINOLEX-CABLE-25',
    category: 'Wires & Cables',
    brand: 'Finolex',
    stockCount: 45,
    images: [
      {
        secure_url: '/images/products/finolex-electrical-cable.png',
        public_id: 'seed/finolex_cable'
      }
    ],
    specifications: [
      { key: 'Gauge', value: '2.5 sq mm' },
      { key: 'Voltage Grade', value: '1100V' },
      { key: 'Conductor', value: 'Multi-strand Copper' }
    ],
    averageRating: 4.7,
    numReviews: 29,
    isFeatured: false
  },
  {
    name: 'Havells House Wire',
    description: 'Superior oxygen-free copper house wire. Flame retardant casing designed specifically for internal domestic power distributions.',
    price: 44.50,
    compareAtPrice: 55.00,
    sku: 'HAVELLS-WIRE-10',
    category: 'Wires & Cables',
    brand: 'Havells',
    stockCount: 85,
    images: [
      {
        secure_url: '/images/products/havells-house-wire.png',
        public_id: 'seed/havells_wire'
      }
    ],
    specifications: [
      { key: 'Gauge', value: '1.0 sq mm' },
      { key: 'Length', value: '90 Meters' },
      { key: 'Material', value: 'Pure Copper' }
    ],
    averageRating: 4.6,
    numReviews: 18,
    isFeatured: false
  },
  {
    name: 'Anchor Flexible Cable',
    description: 'Three-core highly flexible power cord designed for major home appliances, temporary connections, and outdoor power extension lines.',
    price: 36.00,
    compareAtPrice: 42.00,
    sku: 'ANCHOR-FLEX-3C',
    category: 'Wires & Cables',
    brand: 'Anchor',
    stockCount: 2,
    images: [
      {
        secure_url: '/images/products/anchor-flexible-cable.png',
        public_id: 'seed/anchor_flexible_cable'
      }
    ],
    specifications: [
      { key: 'Type', value: '3-Core Circular Flexible' },
      { key: 'Length', value: '50 Meters' },
      { key: 'Current Capacity', value: '10 Amps' }
    ],
    averageRating: 4.5,
    numReviews: 11,
    isFeatured: false
  },
  {
    name: 'RR Kabel Premium Wire',
    description: 'Heavy duty fire survival wire. Engineered with premium insulation to release minimal toxic smoke and halogen gases during emergency hazards.',
    price: 135.00,
    compareAtPrice: 160.00,
    sku: 'RRKABEL-PREM-40',
    category: 'Wires & Cables',
    brand: 'RR Kabel',
    stockCount: 30,
    images: [
      {
        secure_url: '/images/products/rr-kabel-premium-wire.png',
        public_id: 'seed/rrkabel_wire'
      }
    ],
    specifications: [
      { key: 'Gauge', value: '4.0 sq mm' },
      { key: 'Fire Rating', value: 'FR-LSH (Low Smoke Halogen)' },
      { key: 'Voltage Rating', value: '1100V' }
    ],
    averageRating: 4.9,
    numReviews: 34,
    isFeatured: true
  },

  // 3. Ceiling Fans
  {
    name: 'Usha Aerodynamic Ceiling Fan',
    description: 'High-speed 1200mm ceiling fan engineered with energy-efficient copper motor and anti-dust metallic finish for optimal air circulation.',
    price: 54.99,
    compareAtPrice: 69.99,
    sku: 'USHA-AERO-CEIL-1200',
    category: 'Ceiling Fans',
    brand: 'Usha',
    stockCount: 35,
    images: [
      {
        secure_url: '/images/products/usha-ceiling-fan.png',
        public_id: 'seed/usha_ceiling_fan'
      }
    ],
    specifications: [
      { key: 'Sweep Size', value: '1200mm (48 Inches)' },
      { key: 'Motor', value: '100% Copper Motor' },
      { key: 'Speed', value: '380 RPM' },
      { key: 'Air Delivery', value: '235 CMM' }
    ],
    averageRating: 4.7,
    numReviews: 56,
    isFeatured: true
  },
  {
    name: 'Crompton High Speed Fan',
    description: 'Ultra-fast ceiling fan with wide 1200mm sweep blades. Powerful high-torque copper motor ensures broad air distribution quickly.',
    price: 49.99,
    compareAtPrice: 62.00,
    sku: 'CROMPTON-HS-FAN',
    category: 'Ceiling Fans',
    brand: 'Crompton',
    stockCount: 40,
    images: [
      {
        secure_url: '/images/products/crompton-high-speed-fan.png',
        public_id: 'seed/crompton_fan'
      }
    ],
    specifications: [
      { key: 'Sweep', value: '1200mm' },
      { key: 'Speed', value: '400 RPM' },
      { key: 'Air Delivery', value: '230 CMM' }
    ],
    averageRating: 4.6,
    numReviews: 87,
    isFeatured: true
  },
  {
    name: 'Orient Aero Fan',
    description: 'Aerodynamically designed premium ceiling fan. Advanced resin blades produce silent and turbulent-free airflow using minimal energy.',
    price: 119.00,
    compareAtPrice: 145.00,
    sku: 'ORIENT-AERO-FAN',
    category: 'Ceiling Fans',
    brand: 'Orient',
    stockCount: 22,
    images: [
      {
        secure_url: '/images/products/orient-aero-fan.png',
        public_id: 'seed/orient_aerofan'
      }
    ],
    specifications: [
      { key: 'Motor', value: 'Silent BLDC Motor' },
      { key: 'Blades Material', value: 'Glass Filled ABS Resin' },
      { key: 'Power Output', value: '35W' }
    ],
    averageRating: 4.8,
    numReviews: 44,
    isFeatured: true
  },
  {
    name: 'Havells Decorative Fan',
    description: 'Exquisite brushed metallic ceiling fan with integrated LED underlight. Blends aesthetic royalty with modern cooling excellence.',
    price: 155.00,
    compareAtPrice: 180.00,
    sku: 'HAVELLS-DECOR-FAN',
    category: 'Ceiling Fans',
    brand: 'Havells',
    stockCount: 15,
    images: [
      {
        secure_url: '/images/products/havells-decorative-fan.png',
        public_id: 'seed/havells_decor_fan'
      }
    ],
    specifications: [
      { key: 'Aesthetics', value: 'Brushed Metallic Bronze' },
      { key: 'Blades Span', value: '1200mm' },
      { key: 'Underlight', value: 'Dimmable Warm LED' }
    ],
    averageRating: 4.7,
    numReviews: 19,
    isFeatured: false
  },
  {
    name: 'Usha Ceiling Fan',
    description: 'Classic high-performance ceiling fan. Glossy powder-coated paint finish with robust steel double-ball bearings for frictionless operation.',
    price: 34.99,
    compareAtPrice: 42.00,
    sku: 'USHA-SWIFT-FAN',
    category: 'Ceiling Fans',
    brand: 'Usha',
    stockCount: 75,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/usha_fan'
      }
    ],
    specifications: [
      { key: 'Finish', value: 'Powder Coated Ivory' },
      { key: 'Blades', value: '3 Ribbed Aluminum Blades' },
      { key: 'Motor Tech', value: '100% Copper Winding' }
    ],
    averageRating: 4.4,
    numReviews: 92,
    isFeatured: false
  },
  {
    name: 'Bajaj Maxima Fan',
    description: 'Compact high-speed utility ceiling fan. Specially designed wide-angle blades deliver concentrated cooling for tighter kitchen or shop areas.',
    price: 29.99,
    compareAtPrice: 38.00,
    sku: 'BAJAJ-MAXIMA-FAN',
    category: 'Ceiling Fans',
    brand: 'Bajaj',
    stockCount: 4,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/bajaj_fan'
      }
    ],
    specifications: [
      { key: 'Blades Span', value: '600mm' },
      { key: 'Blades Quantity', value: '4 Blades' },
      { key: 'Speed RPM', value: '870 RPM' }
    ],
    averageRating: 4.2,
    numReviews: 28,
    isFeatured: false
  },

  // 4. Smart Devices
  {
    name: 'Smart WiFi Switch',
    description: 'In-wall Wi-Fi smart switch module. Turn your traditional switchboard modular slots into remote-controlled smart nodes effortlessly.',
    price: 24.50,
    compareAtPrice: 32.00,
    sku: 'SMART-WIFI-SWITCH',
    category: 'Smart Devices',
    brand: 'SmartLife',
    stockCount: 110,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/smart_wifi_switch'
      }
    ],
    specifications: [
      { key: 'Gangs Supported', value: '2 Gangs' },
      { key: 'Protocol', value: 'Wi-Fi 2.4GHz' },
      { key: 'Integrations', value: 'Amazon Alexa, Google Home' }
    ],
    averageRating: 4.5,
    numReviews: 39,
    isFeatured: true
  },
  {
    name: 'Smart Door Bell',
    description: 'Premium battery-powered smart video doorbell. View live front door visitors in 1080p HD, with two-way audio and motion sensor pings.',
    price: 89.99,
    compareAtPrice: 110.00,
    sku: 'SMART-DOOR-BELL',
    category: 'Smart Devices',
    brand: 'Ring',
    stockCount: 18,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1622372738946-62e02505fedc?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/smart_doorbell'
      }
    ],
    specifications: [
      { key: 'Video Resolution', value: '1080p HD' },
      { key: 'Night Vision', value: 'Infrared LED' },
      { key: 'Audio', value: 'Two-Way Noise Cancelling' }
    ],
    averageRating: 4.7,
    numReviews: 120,
    isFeatured: true
  },
  {
    name: 'Smart Plug',
    description: 'Compact 16A smart plug with real-time energy logging widgets. Securely control high-power home geysers or air conditioners remotely.',
    price: 18.99,
    compareAtPrice: 25.00,
    sku: 'SMART-PLUG-16A',
    category: 'Smart Devices',
    brand: 'TP-Link',
    stockCount: 140,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/smart_plug'
      }
    ],
    specifications: [
      { key: 'Max Capacity', value: '16 Amps' },
      { key: 'Energy Tracker', value: 'Yes (Live KWh Logs)' },
      { key: 'Voice Commands', value: 'Alexa, Google Assistant, Siri' }
    ],
    averageRating: 4.6,
    numReviews: 61,
    isFeatured: false
  },
  {
    name: 'Motion Sensor Light',
    description: 'Smart ambient light with integrated high-sensitivity motion sensor. Auto-illuminates hallways or staircase landings when movement is caught.',
    price: 11.50,
    compareAtPrice: 15.00,
    sku: 'MOTION-SENSOR-LIGHT',
    category: 'Smart Devices',
    brand: 'Wipro',
    stockCount: 90,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/motion_sensor_light'
      }
    ],
    specifications: [
      { key: 'Sensor Range', value: '5 Meters' },
      { key: 'Detection Angle', value: '120 Degrees' },
      { key: 'Luminous Flux', value: '150 Lumens' }
    ],
    averageRating: 4.4,
    numReviews: 24,
    isFeatured: false
  },
  {
    name: 'Smart Power Strip',
    description: 'Enterprise smart surge-protecting power strip carrying individual Wi-Fi socket triggers, USB fast charging ports, and schedule timers.',
    price: 39.00,
    compareAtPrice: 48.00,
    sku: 'SMART-POWER-STRIP',
    category: 'Smart Devices',
    brand: 'Anker',
    stockCount: 2,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1600697395593-e9dc66797b43?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/smart_powerstrip'
      }
    ],
    specifications: [
      { key: 'Outlets Config', value: '3 AC Sockets + 2 USB-A' },
      { key: 'Surge Protection', value: '1200 Joules' },
      { key: 'Cord Length', value: '5 ft' }
    ],
    averageRating: 4.8,
    numReviews: 55,
    isFeatured: false
  },

  // 5. Switches
  {
    name: 'Anchor Modular Switch',
    description: 'Contractor-favorite modular single-pole home light switch. Fire-resistant, silent click mechanism with classic elegant styling.',
    price: 1.20,
    compareAtPrice: 2.00,
    sku: 'ANCHOR-MOD-SWITCH',
    category: 'Switches',
    brand: 'Anchor',
    stockCount: 300,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/anchor_modular_switch'
      }
    ],
    specifications: [
      { key: 'Current Rating', value: '6 Amps' },
      { key: 'Switch Type', value: '1-Way Single Pole' },
      { key: 'Housing', value: 'Polycarbonate' }
    ],
    averageRating: 4.5,
    numReviews: 89,
    isFeatured: true
  },
  {
    name: 'Havells Switch Board',
    description: 'Premium modular inner metal box and outer glass-finish cover plate assembly. Houses standard modular configurations beautifully.',
    price: 8.50,
    compareAtPrice: 12.00,
    sku: 'HAVELLS-SWITCH-BOARD',
    category: 'Switches',
    brand: 'Havells',
    stockCount: 150,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/havells_switch_board'
      }
    ],
    specifications: [
      { key: 'Size Module', value: '8 Module Slots' },
      { key: 'Plate Design', value: 'Glass Finish' },
      { key: 'Safety', value: 'Shock Proof Surface' }
    ],
    averageRating: 4.4,
    numReviews: 41,
    isFeatured: false
  },
  {
    name: 'Legrand Premium Switch',
    description: 'Artistic premium wall switch. Tactile soft-feel clicking with clean minimalist geometry. Anti-fingerprint matte surface plating.',
    price: 4.50,
    compareAtPrice: 6.00,
    sku: 'LEGRAND-PREM-SWITCH',
    category: 'Switches',
    brand: 'Legrand',
    stockCount: 120,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/legrand_switch'
      }
    ],
    specifications: [
      { key: 'Collection Line', value: 'Arteor Series' },
      { key: 'Switch Action', value: 'Tactile Soft Feel' },
      { key: 'Plating Finish', value: 'Matte Charcoal Grey' }
    ],
    averageRating: 4.8,
    numReviews: 32,
    isFeatured: true
  },
  {
    name: 'GM Modular Switch',
    description: 'High-current modular switch. Engineered specifically to safely trigger heavy electrical induction loads like kitchen microwaves or geysers.',
    price: 2.80,
    compareAtPrice: 4.00,
    sku: 'GM-MODULAR-SWITCH',
    category: 'Switches',
    brand: 'GM',
    stockCount: 160,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1603796846097-bee99e4a60c9?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/gm_switch'
      }
    ],
    specifications: [
      { key: 'Current Capacity', value: '16 Amps' },
      { key: 'Indicator Light', value: 'LED Ambient Glow' },
      { key: 'Working Voltage', value: '240V AC' }
    ],
    averageRating: 4.6,
    numReviews: 27,
    isFeatured: false
  },
  {
    name: 'Goldmedal Switch Panel',
    description: 'Ready-to-install custom modular switch panel combo. Features pre-wired sockets and shuttered plugs for dining room entertainment hubs.',
    price: 14.99,
    compareAtPrice: 20.00,
    sku: 'GOLDMEDAL-SWITCH-PANEL',
    category: 'Switches',
    brand: 'Goldmedal',
    stockCount: 3,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/goldmedal_panel'
      }
    ],
    specifications: [
      { key: 'Outlets Config', value: '4 Switches + 1 Shuttered Socket' },
      { key: 'Plate Design', value: 'Curve Sleek Panel' },
      { key: 'Child Safety', value: 'Spring Loaded Shutters' }
    ],
    averageRating: 4.3,
    numReviews: 12,
    isFeatured: false
  },

  // 6. Extension Boards
  {
    name: '4 Socket Extension Board',
    description: 'Universal 4-socket extension board. High-quality brass connectors preserve grip after thousands of plug cycles. Carry master ON/OFF button.',
    price: 9.99,
    compareAtPrice: 14.00,
    sku: 'ANCHOR-4S-EXT',
    category: 'Extension Boards',
    brand: 'Anchor',
    stockCount: 180,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/anchor_4s_extension'
      }
    ],
    specifications: [
      { key: 'Sockets Quantity', value: '4 Multi-Country Sockets' },
      { key: 'Wire Length', value: '2 Meters' },
      { key: 'Master Switch', value: 'Built-in LED Switch' }
    ],
    averageRating: 4.5,
    numReviews: 76,
    isFeatured: true
  },
  {
    name: 'Spike Guard Extension',
    description: 'Premium surge-protecting spike guard extension. Actively blocks harmful voltage spikes and surges from frying sensitive computing hardware.',
    price: 22.99,
    compareAtPrice: 28.00,
    sku: 'BELKIN-SPIKE-GUARD',
    category: 'Extension Boards',
    brand: 'Belkin',
    stockCount: 95,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/belkin_spike_guard'
      }
    ],
    specifications: [
      { key: 'Surge Suppression', value: '700 Joules' },
      { key: 'Outlets quantity', value: '4 Surge-Protected Outlets' },
      { key: 'Wire Spec', value: 'Heavy Duty 1.5m Cord' }
    ],
    averageRating: 4.8,
    numReviews: 54,
    isFeatured: true
  },
  {
    name: 'USB Charging Extension Board',
    description: 'Modern extension panel featuring high-power USB fast-charging ports alongside standard AC slots. Saves adapter brick clutter on office desks.',
    price: 17.50,
    compareAtPrice: 24.00,
    sku: 'SYSKA-USB-EXT',
    category: 'Extension Boards',
    brand: 'Syska',
    stockCount: 70,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/syska_usb_extension'
      }
    ],
    specifications: [
      { key: 'Ports Integrated', value: '2 USB Ports (2.4A Smart Out) + 3 AC' },
      { key: 'Overload Safety', value: 'Automatic Reset Thermal Circuit' },
      { key: 'Material', value: 'Flame-Resistant ABS Shell' }
    ],
    averageRating: 4.6,
    numReviews: 38,
    isFeatured: false
  },
  {
    name: 'Heavy Duty Extension Board',
    description: 'Industrial-grade 16A extension board carrying heavy copper wire core. Safely power heating radiators, welding irons, or large fridge units.',
    price: 29.50,
    compareAtPrice: 38.00,
    sku: 'CRABTREE-HD-EXT',
    category: 'Extension Boards',
    brand: 'Crabtree',
    stockCount: 40,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/crabtree_hd_ext'
      }
    ],
    specifications: [
      { key: 'Max Wattage Load', value: '3500 Watts' },
      { key: 'Conductor Size', value: '1.5 sq mm Heavy Copper' },
      { key: 'Cord length', value: '5 Meters' }
    ],
    averageRating: 4.7,
    numReviews: 29,
    isFeatured: false
  },
  {
    name: 'Smart Extension Strip',
    description: 'Advanced smart extension strip featuring independent socket Wi-Fi relays. Control individual lamps, fans, or chargers using scheduling rules.',
    price: 45.00,
    compareAtPrice: 55.00,
    sku: 'GOLDMEDAL-SMART-STRIP',
    category: 'Extension Boards',
    brand: 'Goldmedal',
    stockCount: 1,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/goldmedal_smart_strip'
      }
    ],
    specifications: [
      { key: 'Smart Control', value: 'Individual Wi-Fi Switches' },
      { key: 'Sockets', value: '3 AC Outlets' },
      { key: 'Home Sync', value: 'Google Assistant, Amazon Alexa' }
    ],
    averageRating: 4.9,
    numReviews: 47,
    isFeatured: false
  },

  // 7. Electrical Safety Products
  {
    name: 'MCB Circuit Breaker',
    description: 'Double-pole miniature circuit breaker. Instantly trips to shut off supply during short-circuits or load overrides, protecting building wiring.',
    price: 11.99,
    compareAtPrice: 16.00,
    sku: 'SCHNEIDER-MCB-32A',
    category: 'Electrical Safety Products',
    brand: 'Schneider',
    stockCount: 120,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/schneider_mcb'
      }
    ],
    specifications: [
      { key: 'Trip Poles', value: 'Double Pole (DP)' },
      { key: 'Current Threshold', value: '32 Amps' },
      { key: 'Short Circuit Break', value: '10kA Capacity' }
    ],
    averageRating: 4.8,
    numReviews: 65,
    isFeatured: true
  },
  {
    name: 'Voltage Stabilizer',
    description: 'Heavy duty digital voltage stabilizer. Ensures pure constant voltage feed for your premium home air conditioners, protecting compressor coils.',
    price: 54.00,
    compareAtPrice: 68.00,
    sku: 'VGUARD-VOLT-STAB',
    category: 'Electrical Safety Products',
    brand: 'V-Guard',
    stockCount: 35,
    images: [
      {
        secure_url: '/images/products/voltage-stabilizer.png',
        public_id: 'seed/vguard_stabilizer'
      }
    ],
    specifications: [
      { key: 'Power Capacity', value: '4kVA Output' },
      { key: 'Appliances Compatibility', value: 'Up to 1.5 Ton AC' },
      { key: 'Voltage Window', value: '130V to 280V input range' }
    ],
    averageRating: 4.6,
    numReviews: 42,
    isFeatured: true
  },
  {
    name: 'Electrical Gloves',
    description: 'Class 0 high-voltage insulated electrical gloves. Thick natural latex shielding ensures absolute shock insulation up to 1000V AC testing.',
    price: 19.50,
    compareAtPrice: 25.00,
    sku: 'HONEYWELL-ELEC-GLOVES',
    category: 'Electrical Safety Products',
    brand: 'Honeywell',
    stockCount: 65,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1530124560072-aae9150d0619?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/honeywell_gloves'
      }
    ],
    specifications: [
      { key: 'Insulation Class', value: 'Class 0 (Up to 1000V AC)' },
      { key: 'Material Composition', value: 'Natural High-Insulation Latex' },
      { key: 'Testing Certs', value: 'EN60903 Safety Compliant' }
    ],
    averageRating: 4.7,
    numReviews: 18,
    isFeatured: false
  },
  {
    name: 'Insulation Tape Pack',
    description: 'Pack of 5 steelgrip PVC insulating tape rolls. Highly elastic self-extinguishing PVC wrap provides water-resistant seal on copper wire joints.',
    price: 2.99,
    compareAtPrice: 4.50,
    sku: 'STEELGRIP-INSULATION-PACK',
    category: 'Electrical Safety Products',
    brand: '3M Steelgrip',
    stockCount: 220,
    images: [
      {
        secure_url: '/images/products/insulation-tape-pack.png',
        public_id: 'seed/steelgrip_tape'
      }
    ],
    specifications: [
      { key: 'Pack Contents', value: '5 Color-Coded Rolls' },
      { key: 'Adhesives Base', value: 'Self-Extinguishing PVC' },
      { key: 'Max Working Volts', value: '650V Insulation Limit' }
    ],
    averageRating: 4.5,
    numReviews: 83,
    isFeatured: false
  },
  {
    name: 'Surge Protector',
    description: 'Multi-pole surge protection device (SPD) designed for home distribution boards. Diverts thunderbolt electrical spikes directly to earth ground.',
    price: 38.00,
    compareAtPrice: 48.00,
    sku: 'LEGRAND-SPD-3P',
    category: 'Electrical Safety Products',
    brand: 'Legrand',
    stockCount: 4,
    images: [
      {
        secure_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
        public_id: 'seed/legrand_spd'
      }
    ],
    specifications: [
      { key: 'Device Type', value: 'SPD Type 2 Surge Protection' },
      { key: 'Voltage Capacity', value: '230V/400V AC Grid' },
      { key: 'Discharge Current', value: '40kA High Discharge' }
    ],
    averageRating: 4.9,
    numReviews: 29,
    isFeatured: false
  }
];

// Helper to escape special characters in regular expressions
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to seed if database is empty and normalize legacy product records
let isSeededOrMigrated = false;
const autoSeedProducts = async () => {
  if (isSeededOrMigrated) return;
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      logger.info('Product inventory empty. Automatic seeding initiated...');
      await Product.insertMany(SEED_PRODUCTS);
      logger.info(`Product catalog pre-seeded successfully with ${SEED_PRODUCTS.length} high-fidelity items.`);
    } else {
      // Normalize any legacy products where status is null or missing so status="active"
      const updated = await Product.updateMany(
        { $or: [{ status: null }, { status: { $exists: false } }], isActive: { $ne: false } },
        { $set: { status: 'active', isActive: true } }
      );
      if (updated.modifiedCount > 0) {
        logger.info(`Normalized ${updated.modifiedCount} legacy product records with status="active".`);
      }
    }
    isSeededOrMigrated = true;
  } catch (error) {
    logger.error('Failed to auto-seed / normalize products catalog:', error);
  }
};

// Helper to parse multipart/JSON fields safely
const parseJsonField = (field, defaultValue = []) => {
  if (!field) return defaultValue;
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

/**
 * Get all customer-visible products (with Search, Filter, Sort, Paginate).
 */
export const getProducts = asyncHandler(async (req, res, next) => {
  // Ensure database has seed products and legacy records are normalized
  await autoSeedProducts();

  const { search, category, brand, minPrice, maxPrice, sort, page = 1, limit = 9 } = req.query;

  // Build query - show active products to customers (handles both legacy and current schema)
  const queryObj = {
    isActive: { $ne: false },
    status: { $nin: ['draft', 'inactive'] },
  };

  // 1. Category Filter (case-insensitive with regex escaping)
  if (category) {
    const catTrimmed = category.trim();
    if (catTrimmed && !['all', 'all categories', 'all category'].includes(catTrimmed.toLowerCase())) {
      queryObj.category = { $regex: new RegExp(`^${escapeRegex(catTrimmed)}$`, 'i') };
    }
  }

  // 2. Brand Filter (case-insensitive with regex escaping)
  if (brand) {
    const brandTrimmed = brand.trim();
    if (brandTrimmed && !['all', 'all brands', 'all brand'].includes(brandTrimmed.toLowerCase())) {
      queryObj.brand = { $regex: new RegExp(`^${escapeRegex(brandTrimmed)}$`, 'i') };
    }
  }

  // 2b. Featured Filter — handles boolean, string, or alias 'featured'
  const isFeaturedVal = req.query.isFeatured ?? req.query.featured;
  if (isFeaturedVal === 'true' || isFeaturedVal === true || isFeaturedVal === '1') {
    queryObj.isFeatured = true;
  } else if (isFeaturedVal === 'false' || isFeaturedVal === false || isFeaturedVal === '0') {
    queryObj.isFeatured = false;
  }

  // 2c. Specific Product IDs Filter (safe ObjectId validation to prevent query crashes)
  const rawIdsParam = req.query.ids || req.query.featuredIds;
  if (rawIdsParam) {
    const rawIds = Array.isArray(rawIdsParam)
      ? rawIdsParam
      : String(rawIdsParam).split(',').map((id) => id.trim());
    const validIds = rawIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length > 0) {
      queryObj._id = { $in: validIds };
    }
  }

  // 3. Price Filter (USD values in DB)
  if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
    const priceConditions = {};
    if (minPrice !== undefined && minPrice !== '') {
      const parsedMin = Number(minPrice);
      if (!isNaN(parsedMin) && parsedMin >= 0) {
        priceConditions.$gte = parsedMin;
      }
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      const parsedMax = Number(maxPrice);
      if (!isNaN(parsedMax) && parsedMax >= 0) {
        priceConditions.$lte = parsedMax;
      }
    }
    if (Object.keys(priceConditions).length > 0) {
      queryObj.price = priceConditions;
    }
  }

  // 4. Search Filter (safe regex escaping with length limit)
  if (search && typeof search === 'string' && search.trim()) {
    const cleanSearch = escapeRegex(search.trim().slice(0, 100));
    queryObj.$or = [
      { name: { $regex: cleanSearch, $options: 'i' } },
      { description: { $regex: cleanSearch, $options: 'i' } },
      { brand: { $regex: cleanSearch, $options: 'i' } },
      { sku: { $regex: cleanSearch, $options: 'i' } },
      { category: { $regex: cleanSearch, $options: 'i' } },
    ];
  }

  // Define database query
  let query = Product.find(queryObj);

  // 5. Sorting with strict allowlist
  const ALLOWED_SORTS = ['price_asc', 'price_desc', 'rating', 'newest', 'oldest'];
  const safeSort = typeof sort === 'string' && ALLOWED_SORTS.includes(sort) ? sort : 'newest';

  if (safeSort === 'price_asc') {
    query = query.sort({ price: 1 });
  } else if (safeSort === 'price_desc') {
    query = query.sort({ price: -1 });
  } else if (safeSort === 'rating') {
    query = query.sort({ averageRating: -1 });
  } else if (safeSort === 'oldest') {
    query = query.sort({ createdAt: 1 });
  } else {
    query = query.sort({ createdAt: -1 }); // default: newest first
  }

  // 6. Pagination with strict bounds (limit capped at 50 to prevent DoS)
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
  const skip = (pageNum - 1) * limitNum;

  const totalProducts = await Product.countDocuments(queryObj);
  query = query.skip(skip).limit(limitNum);

  // Execute query
  const products = await query;
  const totalPages = Math.ceil(totalProducts / limitNum) || 1;

  ApiResponse.send(
    res,
    200,
    {
      products,
      totalProducts,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
    'Products retrieved successfully.'
  );
});

/**
 * Dedicated Public Endpoint: Get featured products for homepage & marketing showcases.
 * Route: GET /api/v1/products/featured
 */
export const getFeaturedProducts = asyncHandler(async (req, res, next) => {
  await autoSeedProducts();

  const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));

  const queryObj = {
    isFeatured: true,
    isActive: { $ne: false },
    status: { $nin: ['draft', 'inactive'] },
  };

  // Safe ID filter if requested
  const rawIdsParam = req.query.ids || req.query.featuredIds;
  if (rawIdsParam) {
    const rawIds = Array.isArray(rawIdsParam)
      ? rawIdsParam
      : String(rawIdsParam).split(',').map((id) => id.trim());
    const validIds = rawIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length > 0) {
      queryObj._id = { $in: validIds };
    }
  }

  const products = await Product.find(queryObj)
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limitNum);

  ApiResponse.send(
    res,
    200,
    {
      products,
      totalProducts: products.length,
      limit: limitNum,
    },
    'Featured products retrieved successfully.'
  );
});

/**
 * Admin: Get all products with full inventory details (including draft and inactive).
 */
export const adminGetProducts = asyncHandler(async (req, res, next) => {
  await autoSeedProducts();

  const { search, category, status, brand, page = 1, limit = 10, sort = 'newest' } = req.query;

  const queryObj = {};

  if (category) {
    const catTrimmed = category.trim();
    if (catTrimmed && !['all', 'all categories', 'all category'].includes(catTrimmed.toLowerCase())) {
      queryObj.category = { $regex: new RegExp(`^${escapeRegex(catTrimmed)}$`, 'i') };
    }
  }

  if (brand) {
    const brandTrimmed = brand.trim();
    if (brandTrimmed && !['all', 'all brands', 'all brand'].includes(brandTrimmed.toLowerCase())) {
      queryObj.brand = { $regex: new RegExp(`^${escapeRegex(brandTrimmed)}$`, 'i') };
    }
  }

  if (status && status !== 'All') {
    if (status === 'draft') queryObj.status = 'draft';
    else if (status === 'active') queryObj.status = 'active';
    else if (status === 'inactive') queryObj.status = 'inactive';
    else if (status === 'out_of_stock') queryObj.stockCount = { $lte: 0 };
  }

  if (search && typeof search === 'string' && search.trim()) {
    const cleanSearch = escapeRegex(search.trim().slice(0, 100));
    queryObj.$or = [
      { name: { $regex: cleanSearch, $options: 'i' } },
      { sku: { $regex: cleanSearch, $options: 'i' } },
      { brand: { $regex: cleanSearch, $options: 'i' } },
      { category: { $regex: cleanSearch, $options: 'i' } },
      { description: { $regex: cleanSearch, $options: 'i' } },
    ];
  }

  let query = Product.find(queryObj);

  if (sort === 'newest') query = query.sort({ createdAt: -1 });
  else if (sort === 'oldest') query = query.sort({ createdAt: 1 });
  else if (sort === 'price_high') query = query.sort({ price: -1 });
  else if (sort === 'price_low') query = query.sort({ price: 1 });
  else if (sort === 'stock_low') query = query.sort({ stockCount: 1 });
  else if (sort === 'stock_high') query = query.sort({ stockCount: -1 });
  else query = query.sort({ createdAt: -1 });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const totalProducts = await Product.countDocuments(queryObj);
  query = query.skip(skip).limit(limitNum);

  const products = await query;
  const totalPages = Math.ceil(totalProducts / limitNum) || 1;

  ApiResponse.send(
    res,
    200,
    {
      products,
      totalProducts,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
    'Admin product inventory fetched successfully.'
  );
});

/**
 * Get unique product categories list.
 */
export const getProductCategories = asyncHandler(async (req, res, next) => {
  await autoSeedProducts();
  const categories = await Product.distinct('category', {
    isActive: { $ne: false },
    status: { $nin: ['draft', 'inactive'] },
  });
  ApiResponse.send(res, 200, categories, 'Categories retrieved successfully.');
});

/**
 * Get product by ID.
 */
export const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product identifier format.', 400));
  }

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError('Product not found or unavailable.', 404));
  }

  ApiResponse.send(res, 200, product, 'Product details retrieved successfully.');
});

/**
 * Admin: Create new Product.
 */
export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    price,
    compareAtPrice,
    sku,
    category,
    subCategory,
    brand,
    stockCount,
    status = 'active',
    isFeatured = false,
  } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return next(new AppError('Product title is required.', 400));
  }

  if (!sku || !sku.trim()) {
    return next(new AppError('Product SKU is required.', 400));
  }

  const cleanSku = sku.trim().toUpperCase();

  // Enforce unique SKU with friendly error message
  const existingSku = await Product.findOne({ sku: cleanSku });
  if (existingSku) {
    return next(new AppError(`SKU "${cleanSku}" already exists. Please use a unique SKU code.`, 400));
  }

  if (!category || !category.trim()) {
    return next(new AppError('Product category is required.', 400));
  }

  if (!brand || !brand.trim()) {
    return next(new AppError('Product brand is required.', 400));
  }

  if (!description || !description.trim()) {
    return next(new AppError('Product description is required.', 400));
  }

  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return next(new AppError('Price must be a valid positive number.', 400));
  }

  let parsedCompareAtPrice = undefined;
  if (compareAtPrice !== undefined && compareAtPrice !== '' && compareAtPrice !== null) {
    const val = Number(compareAtPrice);
    if (!isNaN(val) && val >= 0) {
      parsedCompareAtPrice = val;
    }
  }

  const parsedStock = parseInt(stockCount);
  if (isNaN(parsedStock) || parsedStock < 0) {
    return next(new AppError('Stock quantity must be a non-negative whole integer.', 400));
  }

  const productStatus = ['draft', 'active', 'inactive'].includes(status) ? status : 'active';
  const isActive = productStatus === 'active';

  // Parse specifications and tags
  const specifications = parseJsonField(req.body.specifications, []);
  const tags = parseJsonField(req.body.tags, []);

  // Process uploaded images via Multer + Cloudinary
  const images = [];

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadToCloudinary(file.buffer, 'sparkcare/products');
      images.push({
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });
    }
  } else if (req.body.images) {
    // In case pre-existing images array or direct image URL payload was provided
    const manualImages = parseJsonField(req.body.images, []);
    manualImages.forEach((img) => {
      if (img && typeof img === 'object' && img.secure_url && img.public_id) {
        images.push({ secure_url: img.secure_url, public_id: img.public_id });
      }
    });
  }

  // Create authoritative product record
  const newProduct = await Product.create({
    name: name.trim(),
    sku: cleanSku,
    description: description.trim(),
    price: parsedPrice,
    compareAtPrice: parsedCompareAtPrice,
    category: category.trim(),
    subCategory: subCategory ? subCategory.trim() : undefined,
    brand: brand.trim(),
    stockCount: parsedStock,
    status: productStatus,
    isActive,
    isFeatured: isFeatured === true || isFeatured === 'true',
    images,
    specifications: specifications.filter((s) => s.key && s.value),
    tags: tags.filter(Boolean),
    createdBy: req.user?._id,
  });

  logger.info(`[Admin Product Created] "${newProduct.name}" (SKU: ${newProduct.sku}) created by admin ${req.user?._id}`);

  ApiResponse.send(res, 201, newProduct, 'Product created and registered in inventory successfully.');
});

/**
 * Admin: Update existing Product.
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product identifier format.', 400));
  }

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  const {
    name,
    description,
    price,
    compareAtPrice,
    sku,
    category,
    subCategory,
    brand,
    stockCount,
    status,
    isFeatured,
    removedImages, // Array of public_ids to purge
  } = req.body;

  // Validate SKU change if provided
  if (sku) {
    const cleanSku = sku.trim().toUpperCase();
    if (cleanSku !== product.sku) {
      const duplicate = await Product.findOne({ sku: cleanSku, _id: { $ne: product._id } });
      if (duplicate) {
        return next(new AppError(`SKU "${cleanSku}" is already taken by another product.`, 400));
      }
      product.sku = cleanSku;
    }
  }

  // Whitelisted updates
  if (name && name.trim()) product.name = name.trim();
  if (description !== undefined && description.trim()) product.description = description.trim();
  if (category && category.trim()) product.category = category.trim();
  if (subCategory !== undefined) product.subCategory = subCategory ? subCategory.trim() : undefined;
  if (brand && brand.trim()) product.brand = brand.trim();

  if (price !== undefined) {
    const p = Number(price);
    if (isNaN(p) || p < 0) {
      return next(new AppError('Price must be a valid non-negative number.', 400));
    }
    product.price = p;
  }

  if (compareAtPrice !== undefined) {
    if (compareAtPrice === '' || compareAtPrice === null) {
      product.compareAtPrice = undefined;
    } else {
      const cap = Number(compareAtPrice);
      if (!isNaN(cap) && cap >= 0) {
        product.compareAtPrice = cap;
      }
    }
  }

  let previousStock = undefined;
  let parsedStock = undefined;
  if (stockCount !== undefined) {
    const sc = parseInt(stockCount);
    if (isNaN(sc) || sc < 0) {
      return next(new AppError('Stock count must be a non-negative whole integer.', 400));
    }
    previousStock = product.stockCount;
    parsedStock = sc;
    product.stockCount = sc;
  }

  if (status && ['draft', 'active', 'inactive'].includes(status)) {
    product.status = status;
    product.isActive = status === 'active';
  }

  if (isFeatured !== undefined) {
    product.isFeatured = isFeatured === true || isFeatured === 'true';
  }

  if (req.body.specifications !== undefined) {
    const specs = parseJsonField(req.body.specifications, []);
    product.specifications = specs.filter((s) => s.key && s.value);
  }

  if (req.body.tags !== undefined) {
    const tags = parseJsonField(req.body.tags, []);
    product.tags = tags.filter(Boolean);
  }

  // Remove purged images from Cloudinary and MongoDB
  const removedPublicIds = parseJsonField(removedImages, []);
  if (removedPublicIds.length > 0) {
    for (const pubId of removedPublicIds) {
      await deleteFromCloudinary(pubId);
    }
    product.images = product.images.filter((img) => !removedPublicIds.includes(img.public_id));
  }

  // Upload new images to Cloudinary if supplied
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadToCloudinary(file.buffer, 'sparkcare/products');
      product.images.push({
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });
    }
  }

  await product.save();

  // Inventory alert side-effects if stock changed
  if (parsedStock !== undefined && previousStock !== undefined) {
    if (parsedStock === 0 && previousStock > 0) {
      notificationService.sendOutOfStockAlert(product).catch((err) =>
        logger.error(`[Alert] Failed to dispatch out-of-stock alert for ${product.name}: ${err.message}`)
      );
    } else if (parsedStock <= 5 && previousStock > 5) {
      notificationService.sendLowStockAlert(product, previousStock, parsedStock).catch((err) =>
        logger.error(`[Alert] Failed to dispatch low-stock alert for ${product.name}: ${err.message}`)
      );
    } else if (parsedStock > 5 && previousStock <= 5) {
      notificationService.resetAlertHistory(product._id);
    }
  }

  logger.info(`[Admin Product Updated] "${product.name}" (ID: ${product._id}) updated successfully.`);

  ApiResponse.send(res, 200, product, 'Product updated successfully.');
});

/**
 * Admin: Toggle product status (draft, active, inactive).
 */
export const toggleProductStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product identifier format.', 400));
  }

  if (!['draft', 'active', 'inactive'].includes(status)) {
    return next(new AppError('Invalid status specified. Must be draft, active, or inactive.', 400));
  }

  const product = await Product.findByIdAndUpdate(
    id,
    {
      status,
      isActive: status === 'active',
    },
    { new: true }
  );

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  ApiResponse.send(res, 200, product, `Product status changed to "${status}".`);
});

/**
 * Admin: Soft Delete / Deactivate product.
 */
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product identifier format.', 400));
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false, status: 'inactive' },
    { new: true }
  );

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  ApiResponse.send(res, 200, product, 'Product deactivated successfully.');
});

/**
 * Admin: Delete single image from Product.
 */
export const deleteProductImage = asyncHandler(async (req, res, next) => {
  const { id, publicId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product identifier format.', 400));
  }

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(publicId);

  // Remove from product images array
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();

  ApiResponse.send(res, 200, product, 'Product image removed successfully.');
});
