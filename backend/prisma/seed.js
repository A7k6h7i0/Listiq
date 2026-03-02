const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function ensureLocation(city, state, country = 'USA') {
  const existing = await prisma.location.findFirst({
    where: { city, state, country },
  });
  if (existing) return existing;
  return prisma.location.create({ data: { city, state, country } });
}

async function seed() {
  const categories = [
    { name: 'Mobiles', slug: 'mobiles' },
    { name: 'Mobile Accessories', slug: 'mobile-accessories' },
    { name: 'Cars', slug: 'cars' },
    { name: 'Car Accessories', slug: 'car-accessories' },
    { name: 'Motorcycles', slug: 'motorcycles' },
    { name: 'Scooters', slug: 'scooters' },
    { name: 'Properties for Sale', slug: 'properties-sale' },
    { name: 'Properties for Rent', slug: 'properties-rent' },
    { name: 'Electronics & Appliances', slug: 'electronics-appliances' },
    { name: 'Computers & Laptops', slug: 'computers-laptops' },
    { name: 'TVs, Video & Audio', slug: 'tvs-video-audio' },
    { name: 'Furniture', slug: 'furniture' },
    { name: 'Home Decor & Garden', slug: 'home-decor-garden' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Books, Sports & Hobbies', slug: 'books-sports-hobbies' },
    { name: 'Bicycles', slug: 'bicycles' },
    { name: 'Pets', slug: 'pets' },
    { name: 'Services', slug: 'services' },
    { name: 'Jobs', slug: 'jobs' },
    { name: 'Business & Industrial', slug: 'business-industrial' },
    { name: 'Agriculture', slug: 'agriculture' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  const indiaLocations = [
    ['Amaravati', 'Andhra Pradesh'],
    ['Itanagar', 'Arunachal Pradesh'],
    ['Dispur', 'Assam'],
    ['Patna', 'Bihar'],
    ['Raipur', 'Chhattisgarh'],
    ['Panaji', 'Goa'],
    ['Gandhinagar', 'Gujarat'],
    ['Chandigarh', 'Haryana'],
    ['Shimla', 'Himachal Pradesh'],
    ['Ranchi', 'Jharkhand'],
    ['Bengaluru', 'Karnataka'],
    ['Thiruvananthapuram', 'Kerala'],
    ['Bhopal', 'Madhya Pradesh'],
    ['Mumbai', 'Maharashtra'],
    ['Imphal', 'Manipur'],
    ['Shillong', 'Meghalaya'],
    ['Aizawl', 'Mizoram'],
    ['Kohima', 'Nagaland'],
    ['Bhubaneswar', 'Odisha'],
    ['Chandigarh', 'Punjab'],
    ['Jaipur', 'Rajasthan'],
    ['Gangtok', 'Sikkim'],
    ['Chennai', 'Tamil Nadu'],
    ['Hyderabad', 'Telangana'],
    ['Agartala', 'Tripura'],
    ['Lucknow', 'Uttar Pradesh'],
    ['Dehradun', 'Uttarakhand'],
    ['Kolkata', 'West Bengal'],
    ['Port Blair', 'Andaman and Nicobar Islands'],
    ['Chandigarh', 'Chandigarh'],
    ['Silvassa', 'Dadra and Nagar Haveli and Daman and Diu'],
    ['New Delhi', 'Delhi'],
    ['Srinagar', 'Jammu and Kashmir'],
    ['Leh', 'Ladakh'],
    ['Kavaratti', 'Lakshadweep'],
    ['Puducherry', 'Puducherry'],
  ];

  for (const [city, state] of indiaLocations) {
    await ensureLocation(city, state, 'India');
  }

  console.log('Seed complete: Indian locations and OLX-style categories are ready.');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
