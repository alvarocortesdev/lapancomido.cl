/**
 * Cloudinary configuration for serving optimized images and videos
 * 
 * All images are hosted on Cloudinary with automatic format detection (WebP/AVIF)
 * and optimized for their specific UI context.
 */

const CLOUD_NAME = 'lapancomido';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
const VIDEO_BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload`;

// Folders structure in Cloudinary
export const FOLDERS = {
  gallery: 'lapancomido/gallery',
  slides: 'lapancomido/slides',
  brand: 'lapancomido/brand',
  videos: 'lapancomido/videos',
};

/**
 * Build a Cloudinary URL with automatic format and quality optimization
 * @param {string} publicId - The public ID of the image (e.g., 'lapancomido/gallery/babka_000')
 * @param {object} options - Optional transformations
 * @returns {string} The optimized Cloudinary URL
 */
export function cloudinaryUrl(publicId, options = {}) {
  const transforms = ['f_auto', 'q_auto'];
  
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  
  return `${BASE_URL}/${transforms.join(',')}/${publicId}`;
}

export function optimizeCloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('/image/upload/')) return url;
  const [prefix, suffix] = url.split('/image/upload/');
  if (!suffix) return url;
  const hasTransforms = /^(f_|q_|w_|h_|c_)/.test(suffix);
  if (hasTransforms) return url;
  const transforms = ['f_auto', 'q_auto'];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  return `${prefix}/image/upload/${transforms.join(',')}/${suffix}`;
}

// Pre-built URLs for brand assets
export const BRAND = {
  logoHeader: `${BASE_URL}/f_auto,q_auto,h_200/${FOLDERS.brand}/logoWeb_cortado`,
  logoFooter: `${BASE_URL}/f_auto,q_auto,h_200/${FOLDERS.brand}/logoRedondo_cortado`,
  pancito404: `${BASE_URL}/f_auto,q_auto,w_400/${FOLDERS.brand}/pancito_404`,
};

// Pre-built URLs for video assets
export const VIDEOS = {
  promo: `${VIDEO_BASE_URL}/q_auto/${FOLDERS.videos}/promo.mp4`,
};

// Slides data with Cloudinary URLs
export const SLIDES = [
  { url: `${BASE_URL}/f_auto,q_auto,w_1920/${FOLDERS.slides}/slide-001`, alt: 'Brioche' },
  { url: `${BASE_URL}/f_auto,q_auto,w_1920/${FOLDERS.slides}/slide-002`, alt: 'Galletas' },
  { url: `${BASE_URL}/f_auto,q_auto,w_1920/${FOLDERS.slides}/slide-003`, alt: 'Pre-Pizzas' },
  { url: `${BASE_URL}/f_auto,q_auto,w_1920/${FOLDERS.slides}/slide-004`, alt: 'Molde Integral' },
  { url: `${BASE_URL}/f_auto,q_auto,w_1920/${FOLDERS.slides}/slide-005`, alt: 'Brioche' },
];

// Gallery images with Cloudinary URLs (used in bento grid)
export const GALLERY_IMAGES = [
  'babka_001', 'babka_002', 'babka_003',
  'batido_000', 'batido_001', 'batido_002',
  'brioche_000', 'brioche_001', 'brioche_002', 'brioche_003', 'brioche_004', 'brioche_005', 'brioche_006',
  'ciabatta_004', 'ciabatta_005',
  'focaccia_000',
  'galleta_000', 'galleta_001', 'galleta_002', 'galleta_003', 'galleta_004', 'galleta_005', 'galleta_006', 'galleta_007',
  'hogaza_000', 'hogaza_001', 'hogaza_002', 'hogaza_003', 'hogaza_004', 'hogaza_005', 'hogaza_006', 'hogaza_007',
  'hogaza_008', 'hogaza_009', 'hogaza_010', 'hogaza_011', 'hogaza_012', 'hogaza_013', 'hogaza_014',
  'hogaza_nuez_000', 'hogaza_nuez_001', 'hogaza_nuez_002',
  'horno_000', 'horno_001',
  'insumos_000', 'insumos_001',
  'kuchen_000',
  'lemon_pie_000', 'lemon_pie_001', 'lemon_pie_002',
  'marca_000', 'marca_001', 'marca_002', 'marca_003', 'marca_004', 'marca_008',
  'masa_000', 'masa_001', 'masa_002', 'masa_003', 'masa_004',
  'masa_madre_000', 'masa_madre_001',
  'miti_mota_000', 'miti_mota_001',
  'molde_000', 'molde_centeno_000',
  'molde_integral_000', 'molde_integral_001', 'molde_integral_002', 'molde_integral_003', 'molde_integral_004',
  'molde_multisemilla_000', 'molde_multisemilla_001',
  'prepizza_000', 'prepizza_001', 'prepizza_002',
  'snicker_pie_000',
];

/**
 * Get gallery image URL by name
 * @param {string} imageName - Image name without extension (e.g., 'babka_001')
 * @returns {string} Optimized Cloudinary URL
 */
export function getGalleryImageUrl(imageName) {
  return `${BASE_URL}/f_auto,q_auto,w_800/${FOLDERS.gallery}/${imageName}`;
}
