# Product images – where to put them

**Put all product images in this folder:**

```
UrbanHarvestHub/frontend/public/images/products/
```

## How it works

1. **Save your image here**  
   Example: `my-product.jpg` or `spinach.jpg`

2. **Use it in the app in one of two ways:**

   - **Option A – Map by product name**  
     Edit `frontend/src/utils/productImages.js` and add your product name and path:
     ```js
     'Baby Spinach': '/images/products/babyspinach.jpg',
     'My New Product': '/images/products/my-product.jpg',
     ```

   - **Option B – Store in the database**  
     If your backend/API stores an `image` URL for each product (e.g. `/images/products/xyz.jpg`), the app will use that automatically. No change needed in `productImages.js`.

## Path in code

- Folder on disk: `frontend/public/images/products/`
- URL path in app: `/images/products/yourfilename.jpg`

Anything in `public/` is served from the site root, so `public/images/products/photo.jpg` → `/images/products/photo.jpg`.

## Naming tips

- Use lowercase and hyphens if you like: `baby-spinach.jpg`
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- Keep names short and clear so they’re easy to map in `productImages.js`
