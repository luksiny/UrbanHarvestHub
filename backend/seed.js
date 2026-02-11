const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sequelize, Workshop, Product, Event, Booking, Admin } = require('./models');

const workshopRows = [
  {
    title: 'Urban Gardening Basics',
    description: 'Learn the fundamentals of growing vegetables in small urban spaces. Perfect for beginners!',
    instructor: 'Sarah Green',
    date: new Date('2024-03-15T10:00:00'),
    duration: 3,
    location: 'Community Center, 123 Main St',
    coordLat: 40.7128,
    coordLng: -74.006,
    price: 45,
    capacity: 20,
    category: 'Gardening',
    tags: ['beginner', 'urban', 'vegetables'],
  },
  {
    title: 'Preserving Your Harvest',
    description: 'Master the art of canning, pickling, and preserving your garden produce.',
    instructor: 'Mike Preserve',
    date: new Date('2024-03-20T14:00:00'),
    duration: 4,
    location: 'Kitchen Studio, 456 Oak Ave',
    coordLat: 40.758,
    coordLng: -73.9855,
    price: 60,
    capacity: 15,
    category: 'Preservation',
    tags: ['canning', 'preservation', 'intermediate'],
  },
  {
    title: 'Sustainable Composting',
    description: 'Turn your kitchen scraps into nutrient-rich compost for your garden.',
    instructor: 'Emma Earth',
    date: new Date('2024-03-25T11:00:00'),
    duration: 2,
    location: 'Green Space, 789 Park Blvd',
    coordLat: 40.7505,
    coordLng: -73.9934,
    price: 35,
    capacity: 25,
    category: 'Sustainability',
    tags: ['composting', 'sustainability', 'all-levels'],
  },
];

const productRows = [
  { name: 'Fresh Tomatoes', description: 'Locally grown, vine-ripened tomatoes perfect for salads and sauces.', price: 4.99, category: 'Vegetables', stock: 50, unit: 'lb', organic: true, tags: ['fresh', 'local', 'tomatoes'], seller: 'Green Valley Farm' },
  { name: 'Rainbow Carrots', description: 'A colorful mix of orange, purple, and yellow carrots from urban gardens.', price: 3.99, category: 'Vegetables', stock: 40, unit: 'bunch', organic: true, tags: ['carrots', 'root', 'rainbow'], seller: 'City Roots Collective' },
  { name: 'Baby Spinach', description: 'Tender baby spinach leaves harvested this morning.', price: 2.99, category: 'Vegetables', stock: 60, unit: 'pack', organic: true, tags: ['greens', 'salad'], seller: 'Rooftop Greens Co' },
  { name: 'Crisp Cucumbers', description: 'Crunchy cucumbers ideal for pickling or snacking.', price: 1.99, category: 'Vegetables', stock: 70, unit: 'lb', organic: false, tags: ['cucumbers', 'snack'], seller: 'Neighborhood Growers' },
  { name: 'Strawberry Punnets', description: 'Sweet, sun-ripened strawberries grown in raised beds.', price: 5.49, category: 'Fruits', stock: 35, unit: 'pack', organic: true, tags: ['berries', 'dessert'], seller: 'Green Valley Farm' },
  { name: 'Urban Orchard Apples', description: 'Crisp apples harvested from community orchard trees.', price: 3.49, category: 'Fruits', stock: 45, unit: 'lb', organic: false, tags: ['apples', 'snack'], seller: 'Urban Orchard Co' },
  { name: 'Backyard Blueberries', description: 'Hand-picked blueberries with intense flavor.', price: 6.99, category: 'Fruits', stock: 25, unit: 'pack', organic: true, tags: ['blueberries', 'antioxidants'], seller: 'Rooftop Greens Co' },
  { name: 'Citrus Medley', description: 'Assorted oranges, lemons, and limes for juicing and cooking.', price: 7.99, category: 'Fruits', stock: 30, unit: 'pack', organic: false, tags: ['citrus', 'mixed'], seller: 'Market Street Collective' },
  { name: 'Organic Basil', description: 'Fragrant organic basil, perfect for pesto and pizza.', price: 3.5, category: 'Herbs', stock: 30, unit: 'bunch', organic: true, tags: ['herbs', 'basil'], seller: 'Herb Garden Co' },
  { name: 'Garden Mint', description: 'Cooling mint leaves ideal for teas and cocktails.', price: 2.5, category: 'Herbs', stock: 35, unit: 'bunch', organic: true, tags: ['mint', 'herbs'], seller: 'Herb Garden Co' },
  { name: 'Rosemary Sprigs', description: 'Woody rosemary sprigs for roasting vegetables and breads.', price: 2.75, category: 'Herbs', stock: 28, unit: 'bunch', organic: false, tags: ['rosemary', 'aromatic'], seller: 'City Roots Collective' },
  { name: 'Coriander (Cilantro) Bunch', description: 'Fresh coriander leaves used in salsas and curries.', price: 2.2, category: 'Herbs', stock: 32, unit: 'bunch', organic: true, tags: ['cilantro', 'coriander'], seller: 'Neighborhood Growers' },
  { name: 'Heirloom Seeds Pack', description: 'Assorted heirloom vegetable seeds for your garden.', price: 12.99, category: 'Seeds', stock: 20, unit: 'pack', organic: true, tags: ['seeds', 'heirloom'], seller: 'Seed Masters' },
  { name: 'Salad Greens Seed Mix', description: 'Blend of lettuce, arugula, and chard seeds for cut-and-come-again harvests.', price: 6.49, category: 'Seeds', stock: 40, unit: 'pack', organic: true, tags: ['salad', 'greens', 'seeds'], seller: 'Seed Masters' },
  { name: 'Pollinator Flower Mix', description: 'Seed mix designed to attract bees and butterflies to your urban garden.', price: 5.99, category: 'Seeds', stock: 35, unit: 'pack', organic: false, tags: ['flowers', 'pollinators'], seller: 'Bee Friendly Co' },
  { name: 'Balcony Tomato Seeds', description: 'Compact tomato variety ideal for balconies and small containers.', price: 4.5, category: 'Seeds', stock: 45, unit: 'pack', organic: true, tags: ['tomato', 'container'], seller: 'City Seeds Collective' },
  { name: 'Brinjal Seeds', description: 'Quality brinjal (eggplant) seeds for growing in pots or garden beds. Great for curries and grilling.', price: 5.99, category: 'Seeds', stock: 30, unit: 'pack', organic: true, tags: ['brinjal', 'eggplant', 'seeds', 'vegetable'], seller: 'Seed Masters' },
  { name: 'Garden Trowel', description: 'Stainless steel garden trowel, perfect for planting.', price: 15.99, category: 'Tools', stock: 15, unit: 'piece', organic: false, tags: ['tools', 'trowel'], seller: 'Garden Tools Inc' },
  { name: 'Pruning Shears', description: 'Bypass pruning shears for trimming herbs and small branches.', price: 18.5, category: 'Tools', stock: 20, unit: 'piece', organic: false, tags: ['pruners', 'tools'], seller: 'Garden Tools Inc' },
  { name: 'Metal Watering Can', description: 'Powder-coated watering can with a fine rose for gentle watering.', price: 24.99, category: 'Tools', stock: 12, unit: 'piece', organic: false, tags: ['watering', 'irrigation'], seller: 'Urban Garden Supply' },
  { name: 'Coco Coir Seed Trays', description: 'Biodegradable seed starting trays made from coco coir.', price: 9.99, category: 'Tools', stock: 30, unit: 'pack', organic: true, tags: ['seed-starting', 'eco'], seller: 'Eco Grow Co' },
  { name: 'Compost Starter Kit', description: 'Microbial starter mix to help jump-start your compost pile.', price: 14.99, category: 'Other', stock: 25, unit: 'pack', organic: true, tags: ['compost', 'sustainability'], seller: 'Green Cycle Co' },
  { name: 'Reusable Produce Bags', description: 'Set of 5 breathable mesh bags for plastic-free shopping.', price: 10.99, category: 'Other', stock: 40, unit: 'pack', organic: false, tags: ['zero-waste', 'bags'], seller: 'Eco Market' },
  { name: 'Soil Test Kit', description: 'Home soil testing kit to measure pH and key nutrients.', price: 19.99, category: 'Other', stock: 18, unit: 'pack', organic: false, tags: ['soil', 'testing'], seller: 'Urban Garden Supply' },
  { name: 'Rain Barrel Diverter', description: 'Downspout diverter to direct rainwater into your barrel.', price: 29.99, category: 'Other', stock: 10, unit: 'piece', organic: false, tags: ['rainwater', 'harvesting'], seller: 'Water Wise Co' },
];

const eventRows = [
  {
    title: 'Spring Harvest Festival',
    description: 'Join us for a celebration of the spring harvest with local vendors, food, and live music!',
    date: new Date('2024-04-10T10:00:00'),
    endDate: new Date('2024-04-10T18:00:00'),
    location: 'City Park, 100 Central Ave',
    coordLat: 40.7614,
    coordLng: -73.9776,
    price: 0,
    capacity: 500,
    category: 'Harvest Festival',
    tags: ['festival', 'community'],
    organizer: 'Urban Harvest Community',
  },
  {
    title: 'Weekly Farmers Market',
    description: 'Fresh produce, local vendors, and community connection every Saturday morning.',
    date: new Date('2024-03-16T08:00:00'),
    endDate: new Date('2024-03-16T13:00:00'),
    location: 'Market Square, 200 Commerce St',
    coordLat: 40.7282,
    coordLng: -73.9942,
    price: 0,
    category: 'Farmers Market',
    tags: ['market', 'weekly'],
    organizer: 'Local Farmers Association',
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL');

    await sequelize.sync({ alter: true });

    await Booking.destroy({ where: {} });
    await Workshop.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Event.destroy({ where: {} });

    const defaultAdminEmail = 'admin@urbanharvesthub.com';
    let admin = await Admin.findOne({ where: { email: defaultAdminEmail } });
    if (!admin) {
      admin = await Admin.create({
        email: defaultAdminEmail,
        password: 'Admin123!',
        name: 'Admin',
      });
      console.log('✅ Default admin created:', defaultAdminEmail, '(password: Admin123!)');
    }

    const workshops = await Workshop.bulkCreate(workshopRows);
    const products = await Product.bulkCreate(productRows);
    const events = await Event.bulkCreate(eventRows);

    console.log('✅ Seed data created successfully!');
    console.log(`   - ${workshops.length} workshops`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${events.length} events`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seed();
