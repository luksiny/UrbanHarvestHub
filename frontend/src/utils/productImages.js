/**
 * Maps each product name to the correct image in public/images/products/.
 * Uses only the images we have: trowel, Pruning_Shears, wateringcan, trays,
 * pollinatorseeds, tomatoseeds (farmers-market and harvestfesstivals are for events).
 */
const PRODUCT_IMAGES = {
  // Tools (exact matches)
  'Garden Trowel': '/images/products/trowel.jpg',
  'Pruning Shears': '/images/products/Pruning_Shears.webp',
  'Metal Watering Can': '/images/products/wateringcan.jpg',
  'Coco Coir Seed Trays': '/images/products/trays.jpg',
  // Seeds
  'Pollinator Flower Mix': '/images/products/pollinatorseeds.webp',
  'Balcony Tomato Seeds': '/images/products/balconytomatoseed.png',
  'Brinjal Seeds': '/images/products/green_brinjal_seeds_long_brinjal_seeds.webp',
  'Heirloom Seeds Pack': '/images/products/heirloom-seeds-pack.webp',
  'Salad Greens Seed Mix': '/images/products/salad-seeds-mix.webp',
  // Vegetables – tomatoseeds = produce/veg, pollinatorseeds = avoid for leafy (wrong bag)
  'Fresh Tomatoes': '/images/products/tomatoseeds.jpg',
  'Rainbow Carrots': '/images/products/carrot2.jpg',
  'Baby Spinach': '/images/products/babyspinach.jpg',
  'Crisp Cucumbers': '/images/products/cucember.jpg',
  // Fruits – mix so citrus/blueberries don’t show tomato image
  'Strawberry Punnets': '/images/products/strawberry2.jpg',
  'Urban Orchard Apples': '/images/products/apples.avif',
  'Backyard Blueberries': '/images/products/backyardblueberries.jpg',
  'Citrus Medley': '/images/products/vibrant-citrus-medley.avif',
  // Herbs
  'Organic Basil': '/images/products/organic-basil.jpg',
  'Garden Mint': '/images/products/mint.webp',
  'Rosemary Sprigs': '/images/products/rosemary.webp',
  'Coriander (Cilantro) Bunch': '/images/products/coriander.jpg',
  // Other – each distinct: compost = trowel, bags = trays, soil test = soiltestkit, rain barrel = wateringcan
  'Compost Starter Kit': '/images/products/trowel.jpg',
  'Reusable Produce Bags': '/images/products/trays.jpg',
  'Soil Test Kit': '/images/products/soiltestkit.jpg',
  'Rain Barrel Diverter': '/images/products/wateringcan.jpg',
  // Gardening / education (saved in products folder)
  'Gardening Guide': '/images/products/educategardening.avif',
  'Starter Seed Kit': '/images/products/educategardening.avif',
  'Garden Education Pack': '/images/products/educategardening.avif',
};

const CATEGORY_FALLBACKS = {
  Seeds: '/images/products/pollinatorseeds.webp',
  Tools: '/images/products/trowel.jpg',
  Vegetables: '/images/products/tomatoseeds.jpg',
  Fruits: '/images/products/tomatoseeds.jpg',
  Herbs: '/images/products/pollinatorseeds.webp',
  Other: '/images/products/educategardening.avif',
};

const DEFAULT_IMAGE = '/images/products/trowel.jpg';

/**
 * If the API returns product.image as just a filename (e.g. "educategardening.avif"),
 * resolve it to the correct path so images saved in public/images/products/ show up.
 */
export function resolveProductImagePath(imageValue) {
  if (!imageValue || typeof imageValue !== 'string') return null;
  const s = imageValue.trim();
  if (!s) return null;
  if (s.startsWith('http') || s.startsWith('/')) return s;
  if (s.includes('/')) return s;
  return '/images/products/' + s.replace(/^\.\//, '');
}

/**
 * Returns the image path for a product. Use product.name and optional product.category.
 */
export function getProductImage(productName, category) {
  const name = typeof productName === 'string' ? productName.trim() : '';
  if (!name) return DEFAULT_IMAGE;
  const exact = PRODUCT_IMAGES[name];
  if (exact) return exact;
  const nameLower = name.toLowerCase();
  const key = Object.keys(PRODUCT_IMAGES).find(k => k.toLowerCase() === nameLower);
  if (key) return PRODUCT_IMAGES[key];
  if (category && CATEGORY_FALLBACKS[category]) return CATEGORY_FALLBACKS[category];
  return DEFAULT_IMAGE;
}

export default getProductImage;
