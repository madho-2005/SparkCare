/**
 * Unified product image resolver.
 * Guarantees identical, robust image resolution across Product Catalog, Details, Home, Cart, Wishlist, and Admin pages.
 */
export const getProductImage = (product) => {
  if (!product) return '/images/products/wipro-smart-led-bulb.png';

  // Handle direct image string path passed
  if (typeof product === 'string') {
    if (product.startsWith('/images/') || product.startsWith('http')) {
      return product;
    }
  }

  // 1. Direct valid image path check from product object
  const rawImg = typeof product.images?.[0] === 'object'
    ? product.images[0]?.secure_url
    : (product.images?.[0] || product.image);

  if (rawImg && typeof rawImg === 'string' && (rawImg.startsWith('/images/products/') || rawImg.startsWith('/images/services/'))) {
    return rawImg;
  }

  // 2. Keyword-based product & brand matching rules
  const name = (product.name || '').toLowerCase();
  const sku = (product.sku || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();

  if (name.includes('usha') || sku.includes('usha') || brand.includes('usha')) return '/images/products/usha-ceiling-fan.png';
  if (name.includes('philips') || sku.includes('philips') || brand.includes('philips')) return '/images/products/philips-9w-led-bulb.png';
  if (name.includes('wipro') || sku.includes('wipro') || brand.includes('wipro')) return '/images/products/wipro-smart-led-bulb.png';
  if (name.includes('panel') || name.includes('downlight') || name.includes('led panel')) return '/images/products/havells-led-panel-light.png';
  if (name.includes('bajaj') || name.includes('emergency')) return '/images/products/bajaj-emergency-led-light.png';
  if (name.includes('syska') || name.includes('tube')) return '/images/products/syska-tube-light.png';
  if (name.includes('polycab')) return '/images/products/polycab-copper-wire.png';
  if (name.includes('finolex')) return '/images/products/finolex-electrical-cable.png';
  if (name.includes('havells') && (name.includes('wire') || sku.includes('wire') || brand.includes('havells'))) return '/images/products/havells-house-wire.png';
  if (name.includes('anchor')) return '/images/products/anchor-flexible-cable.png';
  if (name.includes('rr kabel') || name.includes('kabel')) return '/images/products/rr-kabel-premium-wire.png';
  if (name.includes('crompton')) return '/images/products/crompton-high-speed-fan.png';
  if (name.includes('orient')) return '/images/products/orient-aero-fan.png';
  if (name.includes('thermostat') || name.includes('nest')) return '/images/services/thermostat.png';
  if (name.includes('fan') || name.includes('ceiling')) return '/images/products/usha-ceiling-fan.png';
  if (name.includes('switch') || name.includes('lutron')) return '/images/products/smart-switch.png';
  if (name.includes('outlet') || name.includes('leviton')) return '/images/products/smart-outlet.png';
  if (name.includes('extension') || name.includes('spike')) return '/images/products/extension-board.png';
  if (name.includes('tape')) return '/images/products/insulation-tape-pack.png';
  if (name.includes('stabilizer')) return '/images/products/voltage-stabilizer.png';

  // 3. Fallback
  if (rawImg && typeof rawImg === 'string' && rawImg.trim().length > 0) {
    return rawImg;
  }

  return '/images/products/wipro-smart-led-bulb.png';
};
