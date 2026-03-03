const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureLocation(city, state, country = 'USA') {
  const existing = await prisma.location.findFirst({
    where: { city, state, country },
  });
  if (existing) return existing;
  return prisma.location.create({ data: { city, state, country } });
}

async function ensureDemoUser(userData, hashedPassword) {
  return prisma.user.upsert({
    where: { email: userData.email },
    update: {
      name: userData.name,
      phone: userData.phone,
      password: hashedPassword,
      isVerified: true,
    },
    create: {
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      password: hashedPassword,
      isVerified: true,
    },
  });
}

async function ensureDemoListing(listingData) {
  const existing = await prisma.listing.findFirst({
    where: { title: listingData.title, userId: listingData.userId },
  });

  const imageData = listingData.images.map((url, index) => ({ url, position: index }));

  if (existing) {
    return prisma.listing.update({
      where: { id: existing.id },
      data: {
        description: listingData.description,
        price: listingData.price,
        currency: listingData.currency,
        categoryId: listingData.categoryId,
        locationId: listingData.locationId,
        status: 'APPROVED',
        isBoosted: listingData.isBoosted || false,
        boostExpiry: listingData.boostExpiry || null,
        images: {
          deleteMany: {},
          create: imageData,
        },
      },
      include: { images: true },
    });
  }

  return prisma.listing.create({
    data: {
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      currency: listingData.currency,
      categoryId: listingData.categoryId,
      locationId: listingData.locationId,
      userId: listingData.userId,
      status: 'APPROVED',
      isBoosted: listingData.isBoosted || false,
      boostExpiry: listingData.boostExpiry || null,
      images: {
        create: imageData,
      },
    },
    include: { images: true },
  });
}

async function ensureDemoConversation(listingId, buyerId, sellerId, firstMessage) {
  let conversation = await prisma.conversation.findUnique({
    where: {
      listingId_buyerId: {
        listingId,
        buyerId,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        listingId,
        buyerId,
        sellerId,
      },
    });
  }

  const existingMessage = await prisma.message.findFirst({
    where: { conversationId: conversation.id },
  });

  if (!existingMessage) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: buyerId,
        receiverId: sellerId,
        content: firstMessage,
      },
    });
  }
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

  const demoPasswordHash = await bcrypt.hash('Demo@12345', 12);
  const [sellerOne, sellerTwo, buyer] = await Promise.all([
    ensureDemoUser(
      {
        email: 'seller.one@demo-olx.com',
        name: 'Arjun Seller',
        phone: '+919999001111',
      },
      demoPasswordHash
    ),
    ensureDemoUser(
      {
        email: 'seller.two@demo-olx.com',
        name: 'Priya Seller',
        phone: '+919999002222',
      },
      demoPasswordHash
    ),
    ensureDemoUser(
      {
        email: 'buyer.one@demo-olx.com',
        name: 'Neha Buyer',
        phone: '+919999003333',
      },
      demoPasswordHash
    ),
  ]);

  const demoCatalog = [
    {
      categorySlug: 'mobiles',
      title: 'iPhone 14 128GB - Excellent Condition',
      description: 'Single owner device, battery health 88%, with original box and charger. No repairs.',
      price: 48999,
      city: 'Bengaluru',
      state: 'Karnataka',
      images: [
        'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
        'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
      ],
      isBoosted: true,
      boostDays: 14,
    },
    {
      categorySlug: 'mobile-accessories',
      title: 'OnePlus Buds Pro with Case',
      description: 'Active noise cancellation earbuds in good condition, includes cable and extra ear tips.',
      price: 3999,
      city: 'Hyderabad',
      state: 'Telangana',
      images: [
        'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg',
        'https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg',
      ],
    },
    {
      categorySlug: 'cars',
      title: 'Honda City 2018 Petrol Manual',
      description: 'Top variant, company serviced, valid insurance till next year, all papers clear.',
      price: 675000,
      city: 'Mumbai',
      state: 'Maharashtra',
      images: [
        'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
        'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg',
      ],
    },
    {
      categorySlug: 'car-accessories',
      title: 'Car Dash Camera Full HD',
      description: 'Front dash cam with 1080p recording, night vision, and memory card slot.',
      price: 3200,
      city: 'Chennai',
      state: 'Tamil Nadu',
      images: [
        'https://images.pexels.com/photos/858070/pexels-photo-858070.jpeg',
        'https://images.pexels.com/photos/248747/pexels-photo-248747.jpeg',
      ],
    },
    {
      categorySlug: 'motorcycles',
      title: 'Royal Enfield Classic 350 - 2021',
      description: 'Well maintained bike with low mileage and complete service history.',
      price: 145000,
      city: 'Jaipur',
      state: 'Rajasthan',
      images: [
        'https://images.pexels.com/photos/2393835/pexels-photo-2393835.jpeg',
        'https://images.pexels.com/photos/13861/pexels-photo-13861.jpeg',
      ],
    },
    {
      categorySlug: 'scooters',
      title: 'TVS Ntorq 125 - Good Condition',
      description: 'Used for office commute, recently serviced, insurance active for 8 months.',
      price: 58000,
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      images: [
        'https://images.pexels.com/photos/2519374/pexels-photo-2519374.jpeg',
        'https://images.pexels.com/photos/63530/pexels-photo-63530.jpeg',
      ],
    },
    {
      categorySlug: 'properties-sale',
      title: '2BHK Flat for Sale Near Metro',
      description: 'Semi-furnished 2BHK apartment, 1100 sqft, clear title, covered parking.',
      price: 6200000,
      city: 'New Delhi',
      state: 'Delhi',
      images: [
        'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
        'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
      ],
      isBoosted: true,
      boostDays: 10,
    },
    {
      categorySlug: 'properties-rent',
      title: '1BHK Apartment for Rent',
      description: 'Spacious 1BHK with balcony, ideal for working professionals.',
      price: 18000,
      city: 'Bengaluru',
      state: 'Karnataka',
      images: [
        'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
        'https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg',
      ],
    },
    {
      categorySlug: 'electronics-appliances',
      title: 'Samsung Front Load Washing Machine',
      description: '6.5kg capacity, no issues, selling due to relocation.',
      price: 14500,
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      images: [
        'https://images.pexels.com/photos/4108711/pexels-photo-4108711.jpeg',
        'https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg',
      ],
    },
    {
      categorySlug: 'computers-laptops',
      title: 'Dell XPS 13 (16GB/512GB) - 2022 Model',
      description: 'Intel i7, 16GB RAM, 512GB SSD, original bill available, ideal for coding and office use.',
      price: 72999,
      city: 'New Delhi',
      state: 'Delhi',
      images: [
        'https://images.pexels.com/photos/18105/pexels-photo.jpg',
        'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg',
      ],
      isBoosted: true,
      boostDays: 7,
    },
    {
      categorySlug: 'tvs-video-audio',
      title: 'Sony 43-inch Smart TV',
      description: '4K smart TV with remote and wall mount kit included.',
      price: 26500,
      city: 'Kolkata',
      state: 'West Bengal',
      images: [
        'https://images.pexels.com/photos/678257/pexels-photo-678257.jpeg',
        'https://images.pexels.com/photos/5721904/pexels-photo-5721904.jpeg',
      ],
    },
    {
      categorySlug: 'furniture',
      title: 'Wooden Study Table with Drawers',
      description: 'Solid wood study table, 4x2.5 ft, two drawers. Minor scratches, structurally perfect.',
      price: 6500,
      city: 'Hyderabad',
      state: 'Telangana',
      images: [
        'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg',
        'https://images.pexels.com/photos/245240/pexels-photo-245240.jpeg',
      ],
    },
    {
      categorySlug: 'home-decor-garden',
      title: 'Indoor Plant Set with Ceramic Pots',
      description: 'Set of 5 low-maintenance indoor plants with decorative ceramic planters.',
      price: 2200,
      city: 'Chennai',
      state: 'Tamil Nadu',
      images: [
        'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg',
        'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg',
      ],
    },
    {
      categorySlug: 'fashion',
      title: 'Branded Winter Jacket - Medium',
      description: 'Barely used men\'s winter jacket, warm and lightweight.',
      price: 2500,
      city: 'Patna',
      state: 'Bihar',
      images: [
        'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
        'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg',
      ],
    },
    {
      categorySlug: 'books-sports-hobbies',
      title: 'Complete Cricket Kit for Beginners',
      description: 'Bat, pads, gloves, and helmet in good shape. Great for practice sessions.',
      price: 5400,
      city: 'Jaipur',
      state: 'Rajasthan',
      images: [
        'https://images.pexels.com/photos/163444/sport-treadmill-tor-route-163444.jpeg',
        'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg',
      ],
    },
    {
      categorySlug: 'bicycles',
      title: 'Hybrid Bicycle 21-Speed',
      description: 'Lightweight frame, recently serviced, ideal for city rides and fitness.',
      price: 9800,
      city: 'Pune',
      state: 'Maharashtra',
      images: [
        'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg',
        'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg',
      ],
    },
    {
      categorySlug: 'pets',
      title: 'Golden Retriever Puppy (4 months)',
      description: 'Vaccinated and healthy puppy, friendly temperament and active.',
      price: 18000,
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      images: [
        'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
        'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
      ],
    },
    {
      categorySlug: 'services',
      title: 'Home Deep Cleaning Service',
      description: 'Professional cleaning for 1BHK/2BHK homes with same-day slots available.',
      price: 2499,
      city: 'Mumbai',
      state: 'Maharashtra',
      images: [
        'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg',
        'https://images.pexels.com/photos/6195120/pexels-photo-6195120.jpeg',
      ],
    },
    {
      categorySlug: 'jobs',
      title: 'Need Delivery Executive - Immediate Join',
      description: 'Flexible shifts, two-wheeler required, weekly incentives and fuel allowance.',
      price: 22000,
      city: 'Hyderabad',
      state: 'Telangana',
      images: [
        'https://images.pexels.com/photos/7363052/pexels-photo-7363052.jpeg',
        'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
      ],
    },
    {
      categorySlug: 'business-industrial',
      title: 'Commercial Dough Mixer Machine',
      description: 'Heavy-duty 20L dough mixer, suitable for bakery and cafe use.',
      price: 34000,
      city: 'Kolkata',
      state: 'West Bengal',
      images: [
        'https://images.pexels.com/photos/159291/technology-machine-mechanic-159291.jpeg',
        'https://images.pexels.com/photos/162568/coffee-machine-coffee-cafe-162568.jpeg',
      ],
    },
    {
      categorySlug: 'agriculture',
      title: 'Mini Power Tiller for Small Farms',
      description: 'Petrol-operated mini tiller, strong condition and easy maintenance.',
      price: 47000,
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      images: [
        'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg',
        'https://images.pexels.com/photos/248880/pexels-photo-248880.jpeg',
      ],
    },
  ];

  const requiredSlugs = demoCatalog.map((item) => item.categorySlug);
  const allCategories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true },
  });
  const categoriesBySlug = new Map(allCategories.map((category) => [category.slug, category.id]));

  const hasAllRequiredCategories = requiredSlugs.every((slug) => categoriesBySlug.has(slug));
  if (!hasAllRequiredCategories) {
    throw new Error('Required categories were not found while creating full demo catalog listings.');
  }

  const demoSellers = [sellerOne, sellerTwo];
  const demoListings = await Promise.all(
    demoCatalog.map(async (item, index) => {
      const categoryId = categoriesBySlug.get(item.categorySlug);
      if (!categoryId) {
        throw new Error(`Missing category slug in seed data: ${item.categorySlug}`);
      }

      const location = await ensureLocation(item.city, item.state, 'India');
      const seller = demoSellers[index % demoSellers.length];

      return ensureDemoListing({
        title: item.title,
        description: item.description,
        price: item.price,
        currency: 'INR',
        categoryId,
        locationId: location.id,
        userId: seller.id,
        images: item.images,
        isBoosted: !!item.isBoosted,
        boostExpiry: item.boostDays ? new Date(Date.now() + 1000 * 60 * 60 * 24 * item.boostDays) : null,
      });
    })
  );

  const uncatalogedCategories = allCategories.filter(
    (category) => !requiredSlugs.includes(category.slug)
  );

  const fallbackLocation = await ensureLocation('Mumbai', 'Maharashtra', 'India');
  const extraCategoryListings = await Promise.all(
    uncatalogedCategories.map((category, index) => {
      const seller = demoSellers[index % demoSellers.length];
      return ensureDemoListing({
        title: `${category.name} Demo Listing`,
        description: `Sample listing added for "${category.name}" category to support end-to-end buy/sell flow testing.`,
        price: 9999 + index * 500,
        currency: 'INR',
        categoryId: category.id,
        locationId: fallbackLocation.id,
        userId: seller.id,
        images: [
          'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
          'https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg',
        ],
      });
    })
  );

  const allDemoListings = [...demoListings, ...extraCategoryListings];

  await Promise.all([
    ensureDemoConversation(
      allDemoListings[0].id,
      buyer.id,
      sellerOne.id,
      'Hi, is this phone still available? Can we meet this evening?'
    ),
    ensureDemoConversation(
      allDemoListings[2].id,
      buyer.id,
      sellerTwo.id,
      'Interested in the car. Could you share the latest service details in chat?'
    ),
  ]);

  console.log('Seed complete: categories, Indian locations, demo users, demo listings, and sample chats are ready.');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
