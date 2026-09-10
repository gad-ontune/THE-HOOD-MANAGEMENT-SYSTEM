import { PrismaClient, RoomStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding The Yads Hood Hotel database...\n');

  // ==================== ROLES ====================
  const roles = await Promise.all([
    prisma.role.upsert({ where: { roleName: 'Owner' }, update: {}, create: { roleName: 'Owner', description: 'Hotel owner with full access' } }),
    prisma.role.upsert({ where: { roleName: 'Manager' }, update: {}, create: { roleName: 'Manager', description: 'Hotel manager' } }),
    prisma.role.upsert({ where: { roleName: 'Receptionist' }, update: {}, create: { roleName: 'Receptionist', description: 'Front desk staff' } }),
    prisma.role.upsert({ where: { roleName: 'Restaurant Manager' }, update: {}, create: { roleName: 'Restaurant Manager', description: 'Restaurant operations' } }),
    prisma.role.upsert({ where: { roleName: 'Housekeeping' }, update: {}, create: { roleName: 'Housekeeping', description: 'Cleaning staff' } }),
    prisma.role.upsert({ where: { roleName: 'Finance' }, update: {}, create: { roleName: 'Finance', description: 'Financial management' } }),
    prisma.role.upsert({ where: { roleName: 'Inventory' }, update: {}, create: { roleName: 'Inventory', description: 'Inventory management' } }),
    prisma.role.upsert({ where: { roleName: 'IT' }, update: {}, create: { roleName: 'IT', description: 'System administration' } }),
    prisma.role.upsert({ where: { roleName: 'Chef' }, update: {}, create: { roleName: 'Chef', description: 'Kitchen staff' } }),
  ]);
  console.log(`✓ ${roles.length} roles`);

  // ==================== PERMISSIONS ====================
  const modules = ['Dashboard', 'Guests', 'Rooms', 'Reservations', 'Payments', 'Restaurant', 'Events', 'Inventory', 'Housekeeping', 'Maintenance', 'Reports', 'Employees', 'CMS', 'Settings'];
  const permissions = await Promise.all(
    modules.map(m => prisma.permission.upsert({
      where: { permissionName: `manage_${m.toLowerCase()}` },
      update: {},
      create: { permissionName: `manage_${m.toLowerCase()}`, module: m, description: `Manage ${m}` },
    }))
  );
  console.log(`✓ ${permissions.length} permissions`);

  // ==================== ADMIN USER ====================
  const ownerRole = await prisma.role.findUnique({ where: { roleName: 'Owner' } })!;
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@yadshoodhotel.com' },
    update: {},
    create: {
      username: 'Admin',
      email: 'admin@yadshoodhotel.com',
      passwordHash: adminPassword,
      roleId: (await ownerRole)!.id,
      status: 'ACTIVE',
      mustChangePassword: true,
    },
  });
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const managerRole = await prisma.role.findUnique({ where: { roleName: 'Manager' } })!;
  await prisma.user.upsert({
    where: { email: 'manager@yadshoodhotel.com' },
    update: {},
    create: {
      username: 'Manager',
      email: 'manager@yadshoodhotel.com',
      passwordHash: managerPassword,
      roleId: (await managerRole)!.id,
      status: 'ACTIVE',
      mustChangePassword: true,
    },
  });
  console.log('✓ Admin: admin@yadshoodhotel.com / Admin@123');
  console.log('✓ Manager: manager@yadshoodhotel.com / Manager@123');

  // ==================== AMENITIES ====================
  const amenityNames = ['Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Safe', 'Room Service', 'Free Breakfast', 'Ocean View', 'Balcony', 'Jacuzzi', 'Work Desk', 'Tea/Coffee Maker', 'Hair Dryer', 'Iron', 'Wardrobe'];
  const amenities = await Promise.all(
    amenityNames.map(name => prisma.amenity.upsert({ where: { name }, update: {}, create: { name } }))
  );
  console.log(`✓ ${amenities.length} amenities`);

  // ==================== ROOM TYPES ====================
  const roomTypeData = [
    { name: 'Standard', description: 'Comfortable single/double room with essential amenities', capacity: 2, price: 4500 },
    { name: 'Deluxe', description: 'Spacious room with premium furnishings and great views', capacity: 2, price: 6500 },
    { name: 'Executive', description: 'Premium executive suite with separate living area', capacity: 2, price: 8500 },
    { name: 'Family', description: 'Large family room with extra beds for up to 4 guests', capacity: 4, price: 10000 },
    { name: 'VIP Suite', description: 'Luxury VIP suite with jacuzzi and panoramic views', capacity: 2, price: 15000 },
    { name: 'Presidential', description: 'Ultimate luxury with private lounge and butler service', capacity: 3, price: 25000 },
  ];
  const roomTypes = await Promise.all(
    roomTypeData.map(rt => prisma.roomType.upsert({ where: { name: rt.name }, update: {}, create: rt }))
  );
  console.log(`✓ ${roomTypes.length} room types`);

  // ==================== ROOMS ====================
  for (const rt of roomTypes) {
    const rtAmenities = amenities.slice(0, Math.floor(Math.random() * 5) + 5);
    for (const amenity of rtAmenities) {
      await prisma.roomTypeAmenity.upsert({
        where: { roomTypeId_amenityId: { roomTypeId: rt.id, amenityId: amenity.id } },
        update: {},
        create: { roomTypeId: rt.id, amenityId: amenity.id },
      });
    }
  }
  const floors = [1, 2, 3, 4, 5];
  let roomCount = 0;
  for (const floor of floors) {
    const typeIdx = Math.min(floor - 1, roomTypes.length - 1);
    const rt = roomTypes[typeIdx];
    const roomsPerFloor = floor === 5 ? 3 : 5;
    for (let i = 1; i <= roomsPerFloor; i++) {
      const roomNum = floor * 100 + i;
      await prisma.room.upsert({
        where: { roomNumber: String(roomNum) },
        update: {},
        create: { roomNumber: String(roomNum), roomTypeId: rt.id, floor, price: rt.price, status: 'AVAILABLE' as RoomStatus, description: `${rt.name} — Floor ${floor}, Room ${roomNum}` },
      });
      roomCount++;
    }
  }
  const presType = roomTypes.find(r => r.name === 'Presidential')!;
  await prisma.room.upsert({ where: { roomNumber: 'P001' }, update: {}, create: { roomNumber: 'P001', roomTypeId: presType.id, floor: 5, price: presType.price, status: 'AVAILABLE' as RoomStatus, description: 'Presidential Suite — The ultimate luxury experience' } });
  await prisma.room.upsert({ where: { roomNumber: 'P002' }, update: {}, create: { roomNumber: 'P002', roomTypeId: presType.id, floor: 5, price: presType.price, status: 'AVAILABLE' as RoomStatus, description: 'Presidential Suite — Panoramic views' } });
  roomCount += 2;
  console.log(`✓ ${roomCount} rooms across ${floors.length} floors`);

  // ==================== DEPARTMENTS ====================
  const deptData = [
    { name: 'Management', description: 'Hotel management and executive team' },
    { name: 'Reception', description: 'Front desk, guest services and reservations' },
    { name: 'Housekeeping', description: 'Room cleaning and general upkeep' },
    { name: 'Restaurant', description: 'Food and beverage service' },
    { name: 'Kitchen', description: 'Food preparation and culinary team' },
    { name: 'Finance', description: 'Financial management and accounting' },
    { name: 'Maintenance', description: 'Repairs and facility upkeep' },
    { name: 'Security', description: 'Hotel security and guest safety' },
    { name: 'Human Resources', description: 'Staff recruitment and welfare' },
    { name: 'Sales & Marketing', description: 'Sales, bookings and promotions' },
    { name: 'Laundry', description: 'Linen and guest laundry services' },
    { name: 'Events & Banqueting', description: 'Events, conferences and catering' },
    { name: 'IT', description: 'Information technology and systems' },
  ];
  const departments = await Promise.all(
    deptData.map(d => prisma.department.upsert({ where: { name: d.name }, update: {}, create: d }))
  );
  console.log(`✓ ${departments.length} departments`);

  // ==================== POSITIONS ====================
  const positionData: { title: string; deptName: string }[] = [
    { title: 'General Manager', deptName: 'Management' },
    { title: 'Assistant Manager', deptName: 'Management' },
    { title: 'Front Desk Supervisor', deptName: 'Reception' },
    { title: 'Receptionist', deptName: 'Reception' },
    { title: 'Head of Housekeeping', deptName: 'Housekeeping' },
    { title: 'Housekeeper', deptName: 'Housekeeping' },
    { title: 'Restaurant Manager', deptName: 'Restaurant' },
    { title: 'Waiter/Waitress', deptName: 'Restaurant' },
    { title: 'Head Chef', deptName: 'Kitchen' },
    { title: 'Chef', deptName: 'Kitchen' },
    { title: 'Accountant', deptName: 'Finance' },
    { title: 'Maintenance Technician', deptName: 'Maintenance' },
    { title: 'Security Guard', deptName: 'Security' },
    { title: 'HR Officer', deptName: 'Human Resources' },
    { title: 'Marketing Officer', deptName: 'Sales & Marketing' },
    { title: 'Laundry Attendant', deptName: 'Laundry' },
    { title: 'Events Coordinator', deptName: 'Events & Banqueting' },
    { title: 'IT Officer', deptName: 'IT' },
  ];
  const positions = await Promise.all(
    positionData.map(async p => {
      const dept = departments.find(d => d.name === p.deptName)!;
      return prisma.position.upsert({
        where: { id: 0 }, update: {},
        create: { title: p.title, departmentId: dept.id },
      }).catch(() => null);
    })
  );
  console.log(`✓ ${positions.filter(Boolean).length} positions`);

  // ==================== EMPLOYEES ====================
  const employeeData = [
    { empNum: 'EMP001', first: 'James', last: 'Ochieng', phone: '+254712345001', dept: 'Management', pos: 'General Manager', salary: 120000, hire: '2023-01-15' },
    { empNum: 'EMP002', first: 'Mary', last: 'Wanjiku', phone: '+254712345002', dept: 'Reception', pos: 'Front Desk Supervisor', salary: 55000, hire: '2023-02-01' },
    { empNum: 'EMP003', first: 'Peter', last: 'Kamau', phone: '+254712345003', dept: 'Reception', pos: 'Receptionist', salary: 35000, hire: '2023-03-10' },
    { empNum: 'EMP004', first: 'Grace', last: 'Akinyi', phone: '+254712345004', dept: 'Reception', pos: 'Receptionist', salary: 35000, hire: '2023-03-10' },
    { empNum: 'EMP005', first: 'David', last: 'Mwangi', phone: '+254712345005', dept: 'Housekeeping', pos: 'Head of Housekeeping', salary: 45000, hire: '2023-01-20' },
    { empNum: 'EMP006', first: 'Sarah', last: 'Chebet', phone: '+254712345006', dept: 'Housekeeping', pos: 'Housekeeper', salary: 30000, hire: '2023-04-01' },
    { empNum: 'EMP007', first: 'John', last: 'Kiprop', phone: '+254712345007', dept: 'Housekeeping', pos: 'Housekeeper', salary: 30000, hire: '2023-04-01' },
    { empNum: 'EMP008', first: 'Alice', last: 'Ndung\'u', phone: '+254712345008', dept: 'Restaurant', pos: 'Restaurant Manager', salary: 60000, hire: '2023-02-15' },
    { empNum: 'EMP009', first: 'Brian', last: 'Odhiambo', phone: '+254712345009', dept: 'Restaurant', pos: 'Waiter/Waitress', salary: 28000, hire: '2023-05-01' },
    { empNum: 'EMP010', first: 'Faith', last: 'Wambui', phone: '+254712345010', dept: 'Restaurant', pos: 'Waiter/Waitress', salary: 28000, hire: '2023-05-01' },
    { empNum: 'EMP011', first: 'Chef', last: 'Otieno', phone: '+254712345011', dept: 'Kitchen', pos: 'Head Chef', salary: 80000, hire: '2023-01-10' },
    { empNum: 'EMP012', first: 'Samuel', last: 'Mutua', phone: '+254712345012', dept: 'Kitchen', pos: 'Chef', salary: 45000, hire: '2023-03-15' },
    { empNum: 'EMP013', first: 'Diana', last: 'Atieno', phone: '+254712345013', dept: 'Finance', pos: 'Accountant', salary: 55000, hire: '2023-02-20' },
    { empNum: 'EMP014', first: 'Patrick', last: 'Njoroge', phone: '+254712345014', dept: 'Maintenance', pos: 'Maintenance Technician', salary: 40000, hire: '2023-04-10' },
    { empNum: 'EMP015', first: 'Joseph', last: 'Kiprono', phone: '+254712345015', dept: 'Security', pos: 'Security Guard', salary: 30000, hire: '2023-01-25' },
  ];
  for (const e of employeeData) {
    const dept = departments.find(d => d.name === e.dept)!;
    const pos = positions.find(p => p?.title === e.pos);
    if (!dept || !pos) continue;
    await prisma.employee.upsert({
      where: { employeeNumber: e.empNum },
      update: {},
      create: {
        employeeNumber: e.empNum, firstName: e.first, lastName: e.last, phone: e.phone,
        departmentId: dept.id, positionId: pos.id, basicSalary: e.salary, status: 'ACTIVE',
        hireDate: new Date(e.hire), employmentType: 'PERMANENT',
      },
    });
  }
  console.log(`✓ ${employeeData.length} employees`);

  // ==================== RESTAURANT CATEGORIES & MENU ====================
  const menuCategories = ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Snacks'];
  const createdCategories = await Promise.all(
    menuCategories.map((name, i) => prisma.restaurantCategory.upsert({
      where: { name }, update: {}, create: { name, sortOrder: i + 1 },
    }))
  );

  const menuItems = [
    { name: 'Full Kenyan Breakfast', cat: 'Breakfast', price: 850, desc: 'Mandazi, chapati, eggs, tea, and fresh fruit' },
    { name: 'English Breakfast', cat: 'Breakfast', price: 1200, desc: 'Bacon, eggs, sausages, toast, baked beans' },
    { name: 'Pancakes & Syrup', cat: 'Breakfast', price: 650, desc: 'Fluffy pancakes with honey/maple syrup and fresh fruit' },
    { name: 'Nyama Choma', cat: 'Lunch', price: 1500, desc: 'Grilled beef/goat meat served with kachumbari and ugali' },
    { name: 'Fish & Ugali', cat: 'Lunch', price: 1200, desc: 'Fresh tilapia from Lake Victoria with ugali and sukuma wiki' },
    { name: 'Chicken Biryani', cat: 'Lunch', price: 1100, desc: 'Fragrant spiced rice with tender chicken' },
    { name: 'Vegetable Curry', cat: 'Lunch', price: 800, desc: 'Mixed vegetable curry served with rice or chapati' },
    { name: 'Beef Stew', cat: 'Lunch', price: 900, desc: 'Tender beef slow-cooked in rich tomato gravy' },
    { name: 'Grilled Tilapia', cat: 'Dinner', price: 1400, desc: 'Whole tilapia grilled to perfection with herbs' },
    { name: 'Beef Fillet Steak', cat: 'Dinner', price: 2000, desc: '300g prime cut with mashed potatoes and vegetables' },
    { name: 'Chicken Tandoori', cat: 'Dinner', price: 1300, desc: 'Spiced oven-roasted chicken with mint chutney' },
    { name: 'Vegetable Pilau', cat: 'Dinner', price: 750, desc: 'Spiced rice with mixed vegetables and yogurt' },
    { name: 'Fresh Juice', cat: 'Beverages', price: 350, desc: 'Freshly squeezed orange, mango, or passion fruit juice' },
    { name: 'Chai Tea', cat: 'Beverages', price: 150, desc: 'Traditional Kenyan chai with milk and spices' },
    { name: 'Coffee', cat: 'Beverages', price: 250, desc: 'Freshly brewed Kenyan Arabica coffee' },
    { name: 'Mineral Water (1L)', cat: 'Beverages', price: 150, desc: 'Pure bottled mineral water' },
    { name: 'Soda', cat: 'Beverages', price: 150, desc: 'Coca-Cola, Fanta, Sprite, or Krest' },
    { name: 'Samosas (4 pcs)', cat: 'Snacks', price: 400, desc: 'Crispy beef or vegetable samosas with chili sauce' },
    { name: 'Mandazi (3 pcs)', cat: 'Snacks', price: 200, desc: 'Soft fried African doughnuts' },
    { name: 'French Fries', cat: 'Snacks', price: 350, desc: 'Crispy golden fries with ketchup' },
  ];
  for (const item of menuItems) {
    const cat = createdCategories.find(c => c.name === item.cat)!;
    await prisma.restaurantMenuItem.create({
      data: { name: item.name, description: item.desc, price: item.price, categoryId: cat.id, available: true },
    }).catch(() => {});
  }
  console.log(`✓ ${menuItems.length} menu items in ${createdCategories.length} categories`);

  // ==================== RESTAURANT TABLES ====================
  for (let i = 1; i <= 15; i++) {
    const capacity = i <= 5 ? 2 : i <= 10 ? 4 : 6;
    const location = i <= 5 ? 'Main Hall' : i <= 10 ? 'Terrace' : 'VIP Section';
    await prisma.restaurantTable.upsert({
      where: { tableNumber: i },
      update: {},
      create: { tableNumber: i, capacity, status: 'AVAILABLE', location },
    }).catch(() => {});
  }
  console.log('✓ 15 restaurant tables');

  // ==================== EVENT HALLS ====================
  const halls = [
    { name: 'Grand Ballroom', capacity: 300, price: 50000, description: 'Elegant ballroom for weddings and galas', facilities: 'Stage, sound system, dance floor, AC' },
    { name: 'Garden Terrace', capacity: 150, price: 35000, description: 'Beautiful outdoor garden setting', facilities: 'Gazebo, lighting, garden furniture' },
    { name: 'Conference Hall', capacity: 80, price: 25000, description: 'Professional meeting and conference space', facilities: 'Projector, whiteboard, Wi-Fi, PA system' },
    { name: 'VIP Lounge', capacity: 30, price: 15000, description: 'Intimate private lounge for exclusive events', facilities: 'Bar, TV, AC, private washroom' },
    { name: 'Poolside Deck', capacity: 100, price: 30000, description: 'Relaxed poolside venue for parties', facilities: 'Pool access, BBQ area, bar' },
  ];
  for (const h of halls) {
    await prisma.eventHall.upsert({
      where: { name: h.name },
      update: {},
      create: h,
    });
  }
  console.log(`✓ ${halls.length} event halls`);

  // ==================== EVENT PACKAGES ====================
  const packages = [
    { name: 'Wedding Package', price: 350000, hall: 'Grand Ballroom', maxGuests: 200, items: [{ name: 'Catering (per person)', qty: 200, price: 1500 }, { name: 'Decoration', qty: 1, price: 50000 }] },
    { name: 'Birthday Party', price: 80000, hall: 'Garden Terrace', maxGuests: 50, items: [{ name: 'Catering (per person)', qty: 50, price: 1200 }, { name: 'Cake', qty: 1, price: 8000 }] },
    { name: 'Corporate Event', price: 150000, hall: 'Conference Hall', maxGuests: 80, items: [{ name: 'Tea/Coffee (per person)', qty: 80, price: 500 }, { name: 'Lunch (per person)', qty: 80, price: 1200 }] },
  ];
  for (const pkg of packages) {
    const hall = await prisma.eventHall.findUnique({ where: { name: pkg.hall } });
    if (!hall) continue;
    const created = await prisma.eventPackage.create({
      data: { name: pkg.name, price: pkg.price, hallId: hall.id, maxGuests: pkg.maxGuests, description: `${pkg.name} at ${hall.name}` },
    });
    for (const item of pkg.items) {
      await prisma.eventPackageItem.create({
        data: { packageId: created.id, itemName: item.name, quantity: item.qty, unitPrice: item.price },
      });
    }
  }
  console.log(`✓ ${packages.length} event packages`);

  // ==================== FAQS ====================
  const faqData = [
    { question: 'What time is check-in and check-out?', answer: 'Check-in is from 2:00 PM. Check-out is at 11:00 AM. Early check-in and late check-out are available on request.', sortOrder: 1 },
    { question: 'Do you accept M-Pesa payments?', answer: 'Yes! We accept M-Pesa (Till: 9217965), cash, and card payments.', sortOrder: 2 },
    { question: 'Is breakfast included in the room price?', answer: 'Breakfast is complimentary for Deluxe bookings and above. Standard rooms can add breakfast at KES 850 per person.', sortOrder: 3 },
    { question: 'Do you offer free Wi-Fi?', answer: 'Yes, complimentary high-speed Wi-Fi is available throughout the hotel for all guests.', sortOrder: 4 },
    { question: 'Is parking available?', answer: 'Yes, we offer secure, monitored parking free of charge for all hotel guests.', sortOrder: 5 },
    { question: 'Do you have a restaurant on site?', answer: 'Yes, our restaurant serves breakfast, lunch, and dinner with a mix of Kenyan and international cuisine.', sortOrder: 6 },
    { question: 'Can I host events at the hotel?', answer: 'Absolutely! We have 5 event halls including a grand ballroom, garden terrace, and conference hall.', sortOrder: 7 },
    { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 48 hours before check-in. Late cancellations may incur a one-night charge.', sortOrder: 8 },
    { question: 'Is the hotel family-friendly?', answer: 'Yes, we have Family rooms that sleep up to 4 guests. Children under 6 stay free.', sortOrder: 9 },
    { question: 'Do you offer airport transfers?', answer: 'Yes, airport transfer can be arranged at an additional cost. Please contact reception.', sortOrder: 10 },
  ];
  for (const faq of faqData) {
    await prisma.faq.create({ data: faq }).catch(() => {});
  }
  console.log(`✓ ${faqData.length} FAQs`);

  // ==================== CONTACT INFORMATION ====================
  const contactInfo = [
    { type: 'phone', value: '+254 757 915 384', label: 'Phone' },
    { type: 'email', value: 'yadshoodhotel@gmail.com', label: 'Email' },
    { type: 'whatsapp', value: '+254 757 915 384', label: 'WhatsApp' },
    { type: 'address', value: 'Igena - Mnadani Road, Kehancha, Migori County, Kenya', label: 'Address' },
    { type: 'hours', value: 'Open 24/7 — Reception & Restaurant', label: 'Hours' },
    { type: 'facebook', value: 'https://facebook.com/yadshoodhotel', label: 'Facebook' },
    { type: 'instagram', value: 'https://instagram.com/yadshoodhotel', label: 'Instagram' },
    { type: 'tiktok', value: 'https://tiktok.com/@yadshoodhotel', label: 'TikTok' },
  ];
  for (const ci of contactInfo) {
    await prisma.contactInformation.upsert({
      where: { type: ci.type },
      update: { value: ci.value, label: ci.label },
      create: ci,
    });
  }
  console.log(`✓ ${contactInfo.length} contact entries`);

  // ==================== SEO ====================
  const seoPages = [
    { slug: 'home', title: 'The Yads Hood Hotel — Luxury Hotel in Kehancha, Kenya', desc: 'Experience luxury and comfort at The Yads Hood Hotel in Kehancha, Migori County. Book rooms, dine at our restaurant, and host events.' },
    { slug: 'rooms', title: 'Rooms & Suites — The Yads Hood Hotel', desc: 'Explore our range of comfortable rooms and luxury suites at The Yads Hood Hotel. Standard, Deluxe, Executive, Family, VIP, and Presidential.' },
    { slug: 'restaurant', title: 'Restaurant & Dining — The Yads Hood Hotel', desc: 'Enjoy Kenyan and international cuisine at our restaurant. Breakfast, lunch, dinner, and beverages served daily.' },
    { slug: 'events', title: 'Events & Conferences — The Yads Hood Hotel', desc: 'Host your wedding, birthday, or corporate event at our premier venue in Kehancha. Multiple halls and packages available.' },
    { slug: 'contact', title: 'Contact Us — The Yads Hood Hotel', desc: 'Get in touch with The Yads Hood Hotel. Call +254 757 915 384 or email yadshoodhotel@gmail.com.' },
  ];
  for (const seo of seoPages) {
    await prisma.seo.upsert({
      where: { pageSlug: seo.slug },
      update: { metaTitle: seo.title, metaDescription: seo.desc },
      create: { pageSlug: seo.slug, metaTitle: seo.title, metaDescription: seo.desc },
    });
  }
  console.log(`✓ ${seoPages.length} SEO entries`);

  // ==================== WEBSITE PAGES ====================
  const pages = [
    { slug: 'about', title: 'About Us', content: '<h2>Welcome to The Yads Hood Hotel</h2><p>Located in the heart of Kehancha, Migori County, The Yads Hood Hotel offers a perfect blend of luxury, comfort, and Kenyan hospitality. Our hotel features beautifully appointed rooms, a world-class restaurant, versatile event spaces, and exceptional service that makes every stay memorable.</p><p>Whether you are visiting for business or leisure, our dedicated team ensures you have everything you need for a perfect stay.</p>', published: true },
    { slug: 'privacy', title: 'Privacy Policy', content: '<h2>Privacy Policy</h2><p>Your privacy is important to us. We collect and use personal information solely for the purpose of providing and improving our services. We do not share your information with third parties without your consent.</p>', published: true },
    { slug: 'terms', title: 'Terms & Conditions', content: '<h2>Terms & Conditions</h2><p>By booking a room at The Yads Hood Hotel, you agree to our terms and conditions. Full payment is required at check-in. The hotel is not liable for lost or stolen items. Guests are responsible for any damage to hotel property.</p>', published: true },
  ];
  for (const page of pages) {
    await prisma.websitePage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log(`✓ ${pages.length} website pages`);

  // ==================== INVENTORY UNITS ====================
  const units = [
    { name: 'Kilogram', abbreviation: 'kg' }, { name: 'Liter', abbreviation: 'L' }, { name: 'Piece', abbreviation: 'pc' },
    { name: 'Packet', abbreviation: 'pkt' }, { name: 'Carton', abbreviation: 'ctn' }, { name: 'Bottle', abbreviation: 'btl' },
  ];
  for (const u of units) {
    await prisma.inventoryUnit.upsert({ where: { name: u.name }, update: {}, create: u });
  }
  console.log(`✓ ${units.length} inventory units`);

  // ==================== INVENTORY CATEGORIES ====================
  const invCategories = ['Food & Beverages', 'Cleaning Supplies', 'Linens & Textiles', 'Toiletries', 'Stationery', 'Kitchen Equipment'];
  for (const c of invCategories) {
    await prisma.inventoryCategory.upsert({ where: { name: c }, update: {}, create: { name: c, description: `${c} inventory` } });
  }
  console.log(`✓ ${invCategories.length} inventory categories`);

  // ==================== SYSTEM SETTINGS ====================
  const systemSettings = [
    { key: 'hotel_timezone', value: 'Africa/Nairobi', type: 'string' },
    { key: 'currency', value: 'KES', type: 'string' },
    { key: 'tax_rate', value: '16', type: 'number' },
    { key: 'default_check_in', value: '14:00', type: 'string' },
    { key: 'default_check_out', value: '11:00', type: 'string' },
    { key: 'max_guests_per_room', value: '4', type: 'number' },
    { key: 'cancellation_hours', value: '48', type: 'number' },
    { key: 'auto_confirm_bookings', value: 'true', type: 'boolean' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean' },
    { key: 'app_version', value: '1.0.0', type: 'string' },
  ];
  for (const s of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✓ ${systemSettings.length} system settings`);

  // ==================== NOTIFICATION SETTINGS ====================
  const notifChannels = [
    { channel: 'email', enabled: true }, { channel: 'sms', enabled: true },
    { channel: 'in_app', enabled: true }, { channel: 'whatsapp', enabled: false },
  ];
  for (const nc of notifChannels) {
    await prisma.notificationSetting.upsert({
      where: { channel: nc.channel },
      update: {},
      create: nc,
    });
  }
  console.log(`✓ ${notifChannels.length} notification settings`);

  // ==================== HOTEL SETTINGS ====================
  await prisma.hotelSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      hotelName: 'The Yads Hood Hotel',
      address: 'Igena - Mnadani Road, Kehancha, Migori County, Kenya',
      phone: '+254 757 915 384', email: 'yadshoodhotel@gmail.com',
      checkInTime: '2:00 PM', checkOutTime: '11:00 AM',
      taxRate: 16, currency: 'KES', timezone: 'Africa/Nairobi',
    },
  });

  // ==================== PAYMENT SETTINGS ====================
  for (const pm of [{ method: 'MPESA', enabled: true, tillNumber: '9217965', mpesaShortcode: '9217965' },
                     { method: 'CASH', enabled: true },
                     { method: 'CARD', enabled: true },
                     { method: 'BANK_TRANSFER', enabled: false }]) {
    await prisma.paymentSetting.upsert({
      where: { method: pm.method },
      update: {},
      create: pm,
    });
  }

  // ==================== HOMEPAGE CONTENT ====================
  await prisma.homepageContent.upsert({
    where: { id: 1 },
    update: {},
    create: { heroTitle: 'The Yads Hood Hotel', heroSubtitle: 'Luxury. Comfort. Kenyan Hospitality.' },
  });

  // ==================== HERO SLIDES ====================
  const slides = [
    { imageUrl: '/uploads/hero-hotel.jpg', title: 'Welcome to The Yads Hood Hotel', subtitle: 'Experience luxury in the heart of Kehancha', sortOrder: 1, active: true },
    { imageUrl: '/uploads/hero-room.jpg', title: 'Elegant Rooms & Suites', subtitle: 'Comfort and style for every guest', sortOrder: 2, active: true },
    { imageUrl: '/uploads/hero-events.jpg', title: 'Unforgettable Events', subtitle: 'Weddings, conferences, and celebrations', sortOrder: 3, active: true },
  ];
  for (const slide of slides) {
    await prisma.heroSlide.create({ data: slide }).catch(() => {});
  }
  console.log(`✓ ${slides.length} hero slides`);

  console.log('\n✅ Database seeding complete!');
  console.log('📧 Admin login: admin@yadshoodhotel.com / Admin@123');
  console.log('📧 Manager login: manager@yadshoodhotel.com / Manager@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
