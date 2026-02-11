# Images Directory

This folder contains all static images for the Urban Harvest Hub website.

## Folder Structure

### `/images/products/`
**Purpose:** Product images (tools, seeds, vegetables, fruits, etc.)  
**Usage:** Save product photos here (e.g., pruning-shears.jpg, tomato-seeds.jpg)  
**Example paths in code:** `/images/products/pruning-shears.jpg`

### `/images/workshops/`
**Purpose:** Workshop-related images  
**Usage:** Save workshop photos, instructor images, or workshop banners here  
**Example paths in code:** `/images/workshops/urban-gardening-basics.jpg`

### `/images/events/`
**Purpose:** Event-related images  
**Usage:** Save event photos, festival banners, or market images here  
**Example paths in code:** `/images/events/spring-harvest-festival.jpg`

### `/images/hero/`
**Purpose:** Hero section and background images  
**Usage:** Save large hero images and background photos here  
**Example paths in code:** `/images/hero/gardening-hero.jpg`

### `/images/logos/`
**Purpose:** Logo files  
**Usage:** Save company logos, partner logos, or brand assets here  
**Example paths in code:** `/images/logos/urban-harvest-logo.png`

### `/images/icons/`
**Purpose:** Icon images (if not using icon fonts)  
**Usage:** Save custom icons, favicons, or small graphical elements here  
**Example paths in code:** `/images/icons/location-pin.svg`

## How to Use in React Components

### Option 1: Direct Path (Recommended for public folder)
```jsx
<img src="/images/products/pruning-shears.jpg" alt="Pruning Shears" />
```

### Option 2: In CSS
```css
.hero {
  background-image: url('/images/hero/gardening-hero.jpg');
}
```

## Image Naming Conventions

- Use lowercase letters
- Separate words with hyphens (kebab-case)
- Be descriptive: `pruning-shears.jpg` not `img1.jpg`
- Include product/workshop/event name in filename
- Use appropriate file extensions (.jpg, .png, .svg, .webp)

## Recommended Image Sizes

- **Product images:** 800x800px or 1200x1200px
- **Workshop images:** 1200x800px (landscape)
- **Event images:** 1200x600px (landscape)
- **Hero images:** 1920x1080px or larger
- **Logos:** Original size, SVG preferred
- **Icons:** 64x64px or SVG

## File Format Recommendations

- **Photos:** JPG for photos, PNG for transparency
- **Logos:** SVG (scalable) or PNG (with transparency)
- **Icons:** SVG preferred
- **Optimization:** Compress images before uploading to reduce load times
