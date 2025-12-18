const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Broker = require('./models/Broker');
const Property = require('./models/Property');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Broker.deleteMany();
    await Property.deleteMany();

    console.log('Cleared existing data');

    // Create Users
    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@example.com',
      password: 'password123',
      phone: '+91 98765 43210',
      role: 'customer'
    });

    const brokerUser1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@realestate.com',
      password: 'password123',
      phone: '+91 98765 43211',
      role: 'broker'
    });

    const brokerUser2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@realestate.com',
      password: 'password123',
      phone: '+91 98765 43212',
      role: 'broker'
    });

    console.log('Users created');

    // Create Brokers
    const broker1 = await Broker.create({
      userId: brokerUser1._id,
      company: 'Premium Real Estate',
      licenseNumber: 'RE12345',
      experience: 8,
      rating: 4.8,
      totalReviews: 45,
      specialization: ['residential', 'commercial'],
      servingAreas: ['Mumbai', 'Pune', 'Bangalore'],
      verified: true
    });

    const broker2 = await Broker.create({
      userId: brokerUser2._id,
      company: 'Sharma Properties',
      licenseNumber: 'RE67890',
      experience: 5,
      rating: 4.5,
      totalReviews: 32,
      specialization: ['residential'],
      servingAreas: ['Delhi', 'Gurgaon', 'Noida'],
      verified: true
    });

    console.log('Brokers created');

    // Create Properties
    const properties = [
      {
        title: 'Luxury Villa in Downtown Mumbai',
        description: 'Spacious luxury villa with modern amenities, perfect for families. Features include a private garden, swimming pool, and 24/7 security.',
        propertyType: 'villa',
        listingType: 'sale',
        price: 12500000,
        location: {
          address: '123 Marine Drive',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          coordinates: { latitude: 18.9435, longitude: 72.8234 }
        },
        specifications: {
          bedrooms: 4,
          bathrooms: 3,
          area: 2500,
          floors: 2,
          furnished: 'fully'
        },
        yearBuilt: 2018,
        condition: 'excellent',
        features: ['Parking', 'Garden', 'Security', 'Swimming Pool', 'Gym'],
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
        broker: broker1._id,
        owner: brokerUser1._id,
        status: 'available',
        featured: true
      },
      {
        title: 'Modern 2BHK Apartment in Bandra',
        description: 'Beautiful modern apartment with sea view, fully furnished with contemporary interiors.',
        propertyType: 'apartment',
        listingType: 'rent',
        price: 45000,
        location: {
          address: '45 Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          coordinates: { latitude: 19.0596, longitude: 72.8295 }
        },
        specifications: {
          bedrooms: 2,
          bathrooms: 2,
          area: 1200,
          floors: 1,
          furnished: 'fully'
        },
        yearBuilt: 2020,
        condition: 'new',
        features: ['Parking', 'Security', 'Power Backup', 'Lift'],
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
        broker: broker1._id,
        owner: brokerUser1._id,
        status: 'available',
        featured: true
      },
      {
        title: 'Spacious 3BHK Flat in Pune',
        description: 'Well-maintained 3BHK flat in prime location with all modern amenities.',
        propertyType: 'flat',
        listingType: 'sale',
        price: 8500000,
        location: {
          address: '78 Koregaon Park',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          coordinates: { latitude: 18.5362, longitude: 73.8880 }
        },
        specifications: {
          bedrooms: 3,
          bathrooms: 2,
          area: 1500,
          floors: 1,
          furnished: 'semi'
        },
        yearBuilt: 2019,
        condition: 'excellent',
        features: ['Parking', 'Security', 'Garden', 'Clubhouse'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
        broker: broker1._id,
        owner: brokerUser1._id,
        status: 'available',
        featured: true
      },
      {
        title: 'Cozy 1BHK Apartment in Delhi',
        description: 'Affordable and cozy apartment perfect for singles or couples.',
        propertyType: 'apartment',
        listingType: 'rent',
        price: 25000,
        location: {
          address: '12 Connaught Place',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          coordinates: { latitude: 28.6315, longitude: 77.2167 }
        },
        specifications: {
          bedrooms: 1,
          bathrooms: 1,
          area: 650,
          floors: 1,
          furnished: 'semi'
        },
        yearBuilt: 2021,
        condition: 'new',
        features: ['Parking', 'Security', 'Lift'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        broker: broker2._id,
        owner: brokerUser2._id,
        status: 'available',
        featured: false
      },
      {
        title: 'Beautiful House in Bangalore',
        description: 'Independent house with garden and parking, ideal for families.',
        propertyType: 'house',
        listingType: 'sale',
        price: 9500000,
        location: {
          address: '56 Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
          coordinates: { latitude: 12.9716, longitude: 77.5946 }
        },
        specifications: {
          bedrooms: 3,
          bathrooms: 3,
          area: 2000,
          floors: 2,
          furnished: 'unfurnished'
        },
        yearBuilt: 2017,
        condition: 'good',
        features: ['Parking', 'Garden', 'Security'],
        images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
        broker: broker1._id,
        owner: brokerUser1._id,
        status: 'available',
        featured: true
      },
      {
        title: 'Commercial Space in Gurgaon',
        description: 'Prime commercial property suitable for offices or retail.',
        propertyType: 'commercial',
        listingType: 'rent',
        price: 150000,
        location: {
          address: '89 Cyber City',
          city: 'Gurgaon',
          state: 'Haryana',
          pincode: '122002',
          coordinates: { latitude: 28.4595, longitude: 77.0266 }
        },
        specifications: {
          bedrooms: 0,
          bathrooms: 2,
          area: 3000,
          floors: 1,
          furnished: 'unfurnished'
        },
        yearBuilt: 2019,
        condition: 'excellent',
        features: ['Parking', 'Security', 'Power Backup', 'Lift', 'Cafeteria'],
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
        broker: broker2._id,
        owner: brokerUser2._id,
        status: 'available',
        featured: true
      },
      {
        title: 'Penthouse with Terrace in Mumbai',
        description: 'Luxurious penthouse with private terrace and panoramic city views.',
        propertyType: 'apartment',
        listingType: 'sale',
        price: 25000000,
        location: {
          address: '101 Worli Sea Face',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400018',
          coordinates: { latitude: 19.0144, longitude: 72.8179 }
        },
        specifications: {
          bedrooms: 4,
          bathrooms: 4,
          area: 3500,
          floors: 1,
          furnished: 'fully'
        },
        yearBuilt: 2022,
        condition: 'new',
        features: ['Parking', 'Security', 'Swimming Pool', 'Gym', 'Terrace', 'Clubhouse'],
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
        broker: broker1._id,
        owner: brokerUser1._id,
        status: 'available',
        featured: true
      },
      {
        title: 'Budget Flat in Noida',
        description: 'Affordable 2BHK flat in developing area with good connectivity.',
        propertyType: 'flat',
        listingType: 'sale',
        price: 4500000,
        location: {
          address: '34 Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          coordinates: { latitude: 28.6139, longitude: 77.3910 }
        },
        specifications: {
          bedrooms: 2,
          bathrooms: 2,
          area: 1100,
          floors: 1,
          furnished: 'semi'
        },
        yearBuilt: 2016,
        condition: 'good',
        features: ['Parking', 'Security', 'Lift'],
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
        broker: broker2._id,
        owner: brokerUser2._id,
        status: 'available',
        featured: false
      }
    ];

    for (const property of properties) {
      await Property.create(property);
    }
    console.log('Properties created');

    // Update broker properties
    const allProperties = await Property.find();
    broker1.properties = allProperties.filter(p => p.broker.toString() === broker1._id.toString()).map(p => p._id);
    broker2.properties = allProperties.filter(p => p.broker.toString() === broker2._id.toString()).map(p => p._id);
    
    await broker1.save();
    await broker2.save();

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${allProperties.length} properties`);
    console.log('You can now login with:');
    console.log('Customer: customer@example.com / password123');
    console.log('Broker 1: rajesh@realestate.com / password123');
    console.log('Broker 2: priya@realestate.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};
seedData();