import { internalMutation } from './_generated/server'

// Pexels image helpers — direct URLs with auto-compress
const pexelsPhoto = (id: number, w = 600, h = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

const pexelsAvatar = (id: number) => pexelsPhoto(id, 256, 256)

// ─── Avatar Photos (Pexels portrait IDs) ───
const AVATARS = [
  pexelsAvatar(1239291),  // woman smiling
  pexelsAvatar(1222271),  // man portrait
  pexelsAvatar(733872),   // woman outdoors
  pexelsAvatar(1681010),  // man casual
  pexelsAvatar(774909),   // woman creative
  pexelsAvatar(1043471),  // man stylish
  pexelsAvatar(1065084),  // woman warm
  pexelsAvatar(2379004),  // man friendly
  pexelsAvatar(1130626),  // woman laughing
  pexelsAvatar(614810),   // man professional
  pexelsAvatar(1858175),  // woman artistic
  pexelsAvatar(697509),   // man outdoor
]

// ─── Post Photos (Pexels lifestyle/social IDs) ───
const POST_IMAGES = [
  // food & cafe
  pexelsPhoto(1640777, 800, 600),
  pexelsPhoto(1099680, 800, 600),
  pexelsPhoto(376464, 800, 600),
  pexelsPhoto(1279330, 800, 600),
  // travel & outdoors
  pexelsPhoto(2387873, 800, 600),
  pexelsPhoto(2662116, 800, 600),
  pexelsPhoto(1483024, 800, 600),
  pexelsPhoto(2440061, 800, 600),
  // city & street
  pexelsPhoto(2901209, 800, 600),
  pexelsPhoto(1486222, 800, 600),
  pexelsPhoto(3052361, 800, 600),
  // art & creative
  pexelsPhoto(1266808, 800, 600),
  pexelsPhoto(1578916, 800, 600),
  pexelsPhoto(2693212, 800, 600),
  // nature
  pexelsPhoto(2559941, 800, 600),
  pexelsPhoto(1287145, 800, 600),
  pexelsPhoto(3225517, 800, 600),
  // social & events
  pexelsPhoto(1267696, 800, 600),
  pexelsPhoto(2608517, 800, 600),
  pexelsPhoto(3171837, 800, 600),
  // pets
  pexelsPhoto(1108099, 800, 600),
  pexelsPhoto(2607544, 800, 600),
  pexelsPhoto(1390361, 800, 600),
]

// ─── Service Photos ───
const SERVICE_IMAGES = [
  pexelsPhoto(3184465, 800, 500), // teamwork
  pexelsPhoto(3184291, 800, 500), // workshop
  pexelsPhoto(3184360, 800, 500), // collaboration
  pexelsPhoto(1181263, 800, 500), // office
  pexelsPhoto(3861969, 800, 500), // tech
  pexelsPhoto(3184339, 800, 500), // creative session
  pexelsPhoto(3184405, 800, 500), // meeting
  pexelsPhoto(3184416, 800, 500), // brainstorm
  pexelsPhoto(3184611, 800, 500), // presentation
  pexelsPhoto(3184638, 800, 500), // design work
  pexelsPhoto(1181675, 800, 500), // laptop work
  pexelsPhoto(3184454, 800, 500), // planning
]

// ─── Philippine Locations ───
const LOCATIONS = [
  { name: 'Makati, Metro Manila', lat: 14.5547, lng: 121.0244 },
  { name: 'Quezon City, Metro Manila', lat: 14.676, lng: 121.0437 },
  { name: 'Cebu City, Cebu', lat: 10.3157, lng: 123.8854 },
  { name: 'Davao City, Davao del Sur', lat: 7.1907, lng: 125.4553 },
  { name: 'Taguig, Metro Manila', lat: 14.5176, lng: 121.0509 },
  { name: 'Pasig, Metro Manila', lat: 14.5764, lng: 121.0851 },
  { name: 'Mandaluyong, Metro Manila', lat: 14.5794, lng: 121.0359 },
  { name: 'Iloilo City, Iloilo', lat: 10.7202, lng: 122.5621 },
  { name: 'Baguio City, Benguet', lat: 16.4023, lng: 120.596 },
  { name: 'Tagaytay, Cavite', lat: 14.1153, lng: 120.9621 },
  { name: 'Siargao, Surigao del Norte', lat: 9.8482, lng: 126.0458 },
  { name: 'Palawan, Palawan', lat: 10.0279, lng: 118.7694 },
]

// ─── Dummy User Data ───
const USERS_DATA = [
  { fullName: 'Mara Santos', username: 'mara.santos', email: 'mara@demo.com', bio: 'Freelance photographer based in Makati. Coffee lover & beach bum 🏖️', gender: 'Female', birthday: '1996-03-15' },
  { fullName: 'Javier Cruz', username: 'javcruz', email: 'javier@demo.com', bio: 'Full-stack developer. Building cool things in BGC. Always down for food trips!', gender: 'Male', birthday: '1994-08-22' },
  { fullName: 'Bea Reyes', username: 'bea.reyes', email: 'bea@demo.com', bio: 'Yoga instructor & wellness coach. Let\'s connect mind, body, and soul ✨', gender: 'Female', birthday: '1995-11-07' },
  { fullName: 'Marco Villanueva', username: 'marcoV', email: 'marco@demo.com', bio: 'Guitarist | Music teacher | Cebu-based. Life\'s better with good tunes 🎸', gender: 'Male', birthday: '1993-05-30' },
  { fullName: 'Gia Lim', username: 'gia.lim', email: 'gia@demo.com', bio: 'Interior design enthusiast. Making spaces beautiful, one room at a time 🏡', gender: 'Female', birthday: '1997-01-19' },
  { fullName: 'Enzo Dela Cruz', username: 'enzo.dc', email: 'enzo@demo.com', bio: 'Personal trainer & nutrition coach. Let\'s get you to your best shape 💪', gender: 'Male', birthday: '1992-12-03' },
  { fullName: 'Camille Torres', username: 'camilletorres', email: 'camille@demo.com', bio: 'Baker & pastry chef. Sweet treats that make your day better 🍰', gender: 'Female', birthday: '1998-07-14' },
  { fullName: 'Rafael Aquino', username: 'raf.aquino', email: 'rafael@demo.com', bio: 'Travel blogger exploring every corner of the Philippines. Adventure awaits! 🌴', gender: 'Male', birthday: '1995-09-25' },
  { fullName: 'Isla Garcia', username: 'isla.garcia', email: 'isla@demo.com', bio: 'Graphic designer & illustrator. Creating art that tells stories 🎨', gender: 'Female', birthday: '1996-04-02' },
  { fullName: 'Dan Navarro', username: 'dan.navarro', email: 'dan@demo.com', bio: 'Barista & coffee roaster. Your daily caffeine fix, perfected ☕', gender: 'Male', birthday: '1994-02-18' },
  { fullName: 'Sofia Mendoza', username: 'sofiamendoza', email: 'sofia@demo.com', bio: 'Dog walker & pet sitter. Your fur babies are in good hands 🐕', gender: 'Female', birthday: '1999-06-11' },
  { fullName: 'Luis Ramos', username: 'luis.ramos', email: 'luis@demo.com', bio: 'Surfing instructor in Siargao. Catch waves, not feelings 🏄', gender: 'Male', birthday: '1991-10-08' },
]

// ─── Post Captions ───
const POST_CAPTIONS = [
  { caption: 'Morning coffee hits different when the view is this good ☕', tags: ['coffee', 'morning', 'views', 'lifestyle'] },
  { caption: 'Finally tried this new spot in BGC and wow. The pasta is *chef\'s kiss* 🍝', tags: ['food', 'bgc', 'pasta', 'foodie'] },
  { caption: 'Weekend hike to Mt. Pulag! The sea of clouds was surreal 🏔️', tags: ['hiking', 'mtpulag', 'adventure', 'nature'] },
  { caption: 'New artwork coming together. Can\'t wait to show you the final piece 🎨', tags: ['art', 'wip', 'illustration', 'creative'] },
  { caption: 'Beach day with the squad! Siargao never disappoints 🌊', tags: ['beach', 'siargao', 'friends', 'travel'] },
  { caption: 'Just finished a 10km run. Who says Monday mornings can\'t be productive? 💪', tags: ['fitness', 'running', 'motivation', 'health'] },
  { caption: 'Baked a 3-tier cake for my friend\'s birthday. Turned out amazing! 🎂', tags: ['baking', 'cake', 'birthday', 'homemade'] },
  { caption: 'Golden hour in Intramuros. Manila, you\'re beautiful 🌇', tags: ['photography', 'goldenhour', 'manila', 'intramuros'] },
  { caption: 'Adopted this little guy today! Meet Mochi 🐾', tags: ['adopt', 'puppy', 'pets', 'rescue'] },
  { caption: 'New plant babies for the apartment. The jungle grows 🌿', tags: ['plants', 'plantparent', 'homedecor', 'green'] },
  { caption: 'Street food tour in Mercato. So many good finds!', tags: ['streetfood', 'mercato', 'foodtrip', 'bgc'] },
  { caption: 'Sunset surfing session. This is why I moved to Siargao 🏄‍♂️', tags: ['surfing', 'sunset', 'siargao', 'island'] },
  { caption: 'Working from this cafe today. Best iced latte in Makati imo', tags: ['cafe', 'wfh', 'coffee', 'makati'] },
  { caption: 'Yoga at sunrise. Starting the day right 🧘‍♀️', tags: ['yoga', 'sunrise', 'wellness', 'mindfulness'] },
  { caption: 'Explored Coron for the first time. The lagoons are insane! 💙', tags: ['coron', 'palawan', 'travel', 'lagoon'] },
  { caption: 'Jam session at the studio. New song in the works 🎵', tags: ['music', 'jamming', 'studio', 'original'] },
  { caption: 'Homemade ramen from scratch. Took 12 hours but so worth it 🍜', tags: ['ramen', 'cooking', 'homemade', 'japanese'] },
  { caption: 'Night market vibes in Baguio. The strawberry taho is a must! 🍓', tags: ['baguio', 'nightmarket', 'food', 'travel'] },
  { caption: 'Redecorated my room! Went for a cozy minimalist vibe', tags: ['homedecor', 'minimalist', 'room', 'aesthetic'] },
  { caption: 'Found the cutest bookshop in Iloilo. Stayed for 3 hours 📚', tags: ['books', 'bookshop', 'iloilo', 'reading'] },
  { caption: 'Throwback to our El Nido trip. Planning a return already!', tags: ['elnido', 'throwback', 'beach', 'travel'] },
  { caption: 'First time trying pottery class. It\'s harder than it looks! 🏺', tags: ['pottery', 'class', 'creative', 'hobby'] },
  { caption: 'Dog park morning with Luna and the crew 🐕', tags: ['dogs', 'dogpark', 'morning', 'pets'] },
  { caption: 'Guitar busking at Salcedo Market. Thanks to everyone who stopped by! 🎸', tags: ['busking', 'guitar', 'music', 'salcedo'] },
]

// ─── Services Data ───
const SERVICES_DATA = [
  { title: 'Portrait Photography Session', description: 'Professional portrait photography for individuals, couples, or small groups. Indoor or outdoor settings available. Includes editing and 20+ digital photos.', category: 'Photography', pricePerHour: 1500, tags: ['photography', 'portrait', 'professional'], availability: ['Monday 09:00-17:00', 'Wednesday 09:00-17:00', 'Saturday 09:00-18:00'] },
  { title: 'Full-Stack Web Development', description: 'Custom web app development using React, Node.js, and modern tech stacks. From MVPs to production apps. Let\'s build something great.', category: 'Technology', pricePerHour: 2500, tags: ['webdev', 'react', 'fullstack'], availability: ['Monday 10:00-18:00', 'Tuesday 10:00-18:00', 'Thursday 10:00-18:00', 'Friday 10:00-18:00'] },
  { title: 'Yoga & Meditation Class', description: 'Private or small group yoga sessions tailored to your level. Includes breathwork, stretching, and meditation. All levels welcome!', category: 'Wellness', pricePerHour: 800, tags: ['yoga', 'meditation', 'wellness', 'fitness'], availability: ['Monday 06:00-10:00', 'Wednesday 06:00-10:00', 'Friday 06:00-10:00', 'Saturday 07:00-12:00'] },
  { title: 'Guitar Lessons for Beginners', description: 'Learn guitar from scratch! Acoustic or electric, we\'ll cover chords, strumming, fingerpicking, and your favorite songs. Patient and fun teaching style.', category: 'Music', pricePerHour: 600, tags: ['guitar', 'music', 'lessons', 'beginner'], availability: ['Tuesday 14:00-20:00', 'Thursday 14:00-20:00', 'Saturday 10:00-18:00'] },
  { title: 'Interior Design Consultation', description: 'Transform your space with a professional design consultation. Color palettes, furniture layout, decor sourcing, and mood boards included.', category: 'Design', pricePerHour: 2000, tags: ['interior', 'design', 'home', 'decor'], availability: ['Monday 10:00-16:00', 'Wednesday 10:00-16:00', 'Friday 10:00-16:00'] },
  { title: 'Personal Training & Nutrition', description: 'Custom workout plans and nutrition coaching. Whether you want to lose weight, gain muscle, or just feel better — I\'ve got you covered.', category: 'Fitness', pricePerHour: 1200, tags: ['fitness', 'training', 'nutrition', 'health'], availability: ['Monday 06:00-12:00', 'Tuesday 06:00-12:00', 'Wednesday 06:00-12:00', 'Thursday 06:00-12:00', 'Friday 06:00-12:00'] },
  { title: 'Custom Cake & Pastry Orders', description: 'Beautiful custom cakes and pastries for any occasion. Birthday cakes, wedding cakes, cupcakes, and more. Made with love and premium ingredients.', category: 'Food', pricePerHour: 900, tags: ['baking', 'cake', 'pastry', 'custom'], availability: ['Tuesday 09:00-17:00', 'Thursday 09:00-17:00', 'Saturday 09:00-15:00'] },
  { title: 'Travel Photography & Guide', description: 'Join me on photo-worthy adventures around the Philippines. I\'ll take you to the best spots and capture stunning photos of your trip.', category: 'Photography', pricePerHour: 1800, tags: ['travel', 'photography', 'guide', 'adventure'], availability: ['Wednesday 08:00-18:00', 'Saturday 06:00-18:00', 'Sunday 06:00-18:00'] },
  { title: 'Logo & Brand Identity Design', description: 'Get a unique brand identity for your business. Logo, color palette, typography, and brand guidelines — everything you need to stand out.', category: 'Design', pricePerHour: 2200, tags: ['logo', 'branding', 'design', 'graphic'], availability: ['Monday 09:00-17:00', 'Tuesday 09:00-17:00', 'Wednesday 09:00-17:00', 'Thursday 09:00-17:00'] },
  { title: 'Specialty Coffee Brewing Workshop', description: 'Learn pour-over, french press, aeropress, and cold brew techniques. Includes coffee tasting and beans to take home. Perfect for coffee lovers!', category: 'Food', pricePerHour: 700, tags: ['coffee', 'brewing', 'workshop', 'barista'], availability: ['Saturday 09:00-15:00', 'Sunday 09:00-15:00'] },
  { title: 'Dog Walking & Pet Sitting', description: 'Reliable and loving care for your fur babies. Daily walks, overnight sitting, and play sessions. Your pets will love me!', category: 'Pets', pricePerHour: 400, tags: ['dogs', 'pets', 'walking', 'sitting'], availability: ['Monday 07:00-19:00', 'Tuesday 07:00-19:00', 'Wednesday 07:00-19:00', 'Thursday 07:00-19:00', 'Friday 07:00-19:00', 'Saturday 08:00-17:00'] },
  { title: 'Surfing Lessons in Siargao', description: 'Beginner to intermediate surf lessons at Cloud 9 and surrounding breaks. Board and rash guard included. Let\'s ride some waves!', category: 'Sports', pricePerHour: 1000, tags: ['surfing', 'siargao', 'lessons', 'ocean'], availability: ['Monday 06:00-12:00', 'Tuesday 06:00-12:00', 'Wednesday 06:00-12:00', 'Thursday 06:00-12:00', 'Friday 06:00-12:00', 'Saturday 06:00-12:00'] },
]

// ─── Comment Templates ───
const COMMENT_TEXTS = [
  'This is amazing! 🔥',
  'Love this so much!',
  'Where is this? Need to visit!',
  'You\'re so talented!',
  'Goals tbh 😍',
  'Adding this to my bucket list!',
  'The vibes are immaculate ✨',
  'Can I join next time? 😂',
  'This made my day!',
  'How do you do it? Teach me!',
  'Grabe ang ganda! 💯',
  'So inspiring!',
  'Need more of this content!',
  'Best thing I\'ve seen today',
  'Sana all! 🥺',
  'Take me there pls',
  'This is everything 🙌',
  'You never miss!',
  'Obsessed with this!',
  'Drop the location pin! 📍',
]

const REPLY_TEXTS = [
  'Thank you so much! 🥰',
  'Haha for sure! Let\'s plan it!',
  'Right?! It was incredible!',
  'Tysm! Means a lot 💕',
  'Let\'s gooo! DM me!',
  'Aww thanks!!',
  'Will post more soon!',
  'I know right?! So good!',
]

// ─── Message Threads ───
const MESSAGE_THREADS = [
  [
    'Hey! I saw your photography work — it\'s stunning!',
    'Thanks so much! That means a lot 😊',
    'Would you be available for a portrait shoot this weekend?',
    'For sure! I\'m free Saturday afternoon. Want to meet at BGC?',
    'Perfect! See you there!',
  ],
  [
    'Hey are you still offering the yoga classes?',
    'Yes! I have slots on Monday and Wednesday mornings',
    'Monday works for me! What should I bring?',
    'Just a yoga mat and water bottle. Wear comfy clothes!',
    'Got it! Looking forward to it 🧘‍♀️',
    'See you then! Namaste 🙏',
  ],
  [
    'Bro that surf video was insane 🏄',
    'Haha thanks man! The waves were perfect that day',
    'I need to learn. How much for lessons?',
    'For friends, 800/hr. Come to Siargao this month!',
    'Deal! Booking my flight now 😂',
  ],
  [
    'Your cake designs are so beautiful!',
    'Thank you! Which one caught your eye?',
    'The floral one! Can you make something similar for my mom\'s birthday?',
    'Absolutely! When do you need it?',
    'Next Saturday. Is that enough time?',
    'Yep! I\'ll send you some design options tonight',
    'You\'re the best! 🎂',
  ],
]

// ─── Helpers ───
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function daysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000
}

function hoursAgo(hours: number): number {
  return Date.now() - hours * 60 * 60 * 1000
}

// ═══════════════════════════════════════
// SEED MUTATION
// Run via Convex dashboard: api.seed.seedAll
// ═══════════════════════════════════════
export const seedAll = internalMutation({
  handler: async (ctx) => {
    // Check if seed data already exists
    const existingUsers = await ctx.db.query('users').collect()
    const seedUsers = existingUsers.filter((u) => u.email.endsWith('@demo.com'))
    if (seedUsers.length > 0) {
      return { error: 'Seed data already exists. Run clearSeed first.' }
    }

    const now = Date.now()

    // ─── 1. Create Users ───
    const userIds = []
    for (let i = 0; i < USERS_DATA.length; i++) {
      const userData = USERS_DATA[i]
      const loc = LOCATIONS[i % LOCATIONS.length]
      const userId = await ctx.db.insert('users', {
        clerkId: `seed_${userData.username}`,
        email: userData.email,
        fullName: userData.fullName,
        username: userData.username,
        avatarUrl: AVATARS[i],
        bio: userData.bio,
        phoneNumber: `+639${String(170000000 + i).slice(0, 9)}`,
        birthday: userData.birthday,
        gender: userData.gender,
        location: loc.name,
        locationLat: loc.lat,
        locationLng: loc.lng,
        isLocationVisible: true,
        isVerified: i < 6,
        isOnboardingComplete: true,
        createdAt: daysAgo(90 - i * 5),
        updatedAt: daysAgo(i),
      })
      userIds.push(userId)
    }

    // ─── 2. Create Follow Relationships ───
    // Each user follows 4-8 random other users
    for (let i = 0; i < userIds.length; i++) {
      const others = userIds.filter((_, idx) => idx !== i)
      const toFollow = randomSubset(others, 4, 8)
      for (const followingId of toFollow) {
        await ctx.db.insert('follows', {
          followerId: userIds[i],
          followingId,
          createdAt: daysAgo(Math.floor(Math.random() * 60)),
        })
      }
    }

    // ─── 3. Create Posts ───
    const postIds = []
    for (let i = 0; i < POST_CAPTIONS.length; i++) {
      const postData = POST_CAPTIONS[i]
      const userIdx = i % userIds.length
      const imageCount = 1 + Math.floor(Math.random() * 3)
      const images = randomSubset(POST_IMAGES, imageCount, imageCount)
      const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]

      const postId = await ctx.db.insert('posts', {
        userId: userIds[userIdx],
        caption: postData.caption,
        images,
        tags: postData.tags,
        location: loc.name,
        likesCount: 0,
        commentsCount: 0,
        createdAt: daysAgo(30 - i) + Math.floor(Math.random() * 86400000),
        updatedAt: daysAgo(30 - i),
      })
      postIds.push(postId)
    }

    // ─── 4. Create Likes on Posts ───
    for (const postId of postIds) {
      const likers = randomSubset(userIds, 2, 8)
      let likeCount = 0
      for (const userId of likers) {
        await ctx.db.insert('likes', {
          userId,
          postId,
          createdAt: daysAgo(Math.floor(Math.random() * 25)),
        })
        likeCount++
      }
      await ctx.db.patch(postId, { likesCount: likeCount })
    }

    // ─── 5. Create Comments ───
    const commentIds = []
    for (const postId of postIds) {
      const commentCount = 1 + Math.floor(Math.random() * 4)
      let totalComments = 0
      for (let c = 0; c < commentCount; c++) {
        const commentUserId = randomFrom(userIds)
        const commentId = await ctx.db.insert('comments', {
          postId,
          userId: commentUserId,
          content: randomFrom(COMMENT_TEXTS),
          likesCount: Math.floor(Math.random() * 5),
          createdAt: daysAgo(Math.floor(Math.random() * 20)),
          updatedAt: daysAgo(Math.floor(Math.random() * 20)),
        })
        commentIds.push(commentId)
        totalComments++

        // 40% chance of a reply
        if (Math.random() < 0.4) {
          const post = await ctx.db.get(postId)
          if (post) {
            await ctx.db.insert('comments', {
              postId,
              userId: post.userId,
              parentCommentId: commentId,
              content: randomFrom(REPLY_TEXTS),
              likesCount: Math.floor(Math.random() * 3),
              createdAt: daysAgo(Math.floor(Math.random() * 18)),
              updatedAt: daysAgo(Math.floor(Math.random() * 18)),
            })
            totalComments++
          }
        }
      }
      await ctx.db.patch(postId, { commentsCount: totalComments })
    }

    // ─── 6. Create Services ───
    const serviceIds = []
    for (let i = 0; i < SERVICES_DATA.length; i++) {
      const svc = SERVICES_DATA[i]
      const userIdx = i % userIds.length
      const loc = LOCATIONS[userIdx % LOCATIONS.length]

      const serviceId = await ctx.db.insert('services', {
        userId: userIds[userIdx],
        title: svc.title,
        description: svc.description,
        category: svc.category,
        pricePerHour: svc.pricePerHour,
        availability: svc.availability,
        location: loc.name,
        tags: svc.tags,
        images: [SERVICE_IMAGES[i % SERVICE_IMAGES.length], SERVICE_IMAGES[(i + 3) % SERVICE_IMAGES.length]],
        isActive: true,
        createdAt: daysAgo(60 - i * 3),
        updatedAt: daysAgo(i * 2),
      })
      serviceIds.push(serviceId)
    }

    // ─── 7. Create Bookings ───
    const bookingIds = []
    const bookingStatuses = ['completed', 'completed', 'completed', 'accepted', 'pending']
    for (let i = 0; i < 8; i++) {
      const serviceIdx = i % serviceIds.length
      const service = await ctx.db.get(serviceIds[serviceIdx])
      if (!service) continue

      // Pick a booker who isn't the service owner
      let bookerIdx = (i + 3) % userIds.length
      if (userIds[bookerIdx] === service.userId) {
        bookerIdx = (bookerIdx + 1) % userIds.length
      }

      const status = bookingStatuses[i % bookingStatuses.length]
      const duration = 1 + Math.floor(Math.random() * 3)

      const bookingId = await ctx.db.insert('bookings', {
        bookerId: userIds[bookerIdx],
        serviceId: serviceIds[serviceIdx],
        ownerId: service.userId,
        scheduledDate: status === 'pending' ? Date.now() + 3 * 86400000 : daysAgo(20 - i * 2),
        duration,
        totalPrice: service.pricePerHour * duration,
        notes: i % 2 === 0 ? 'Looking forward to this!' : undefined,
        status,
        paymentStatus: status === 'completed' ? 'paid' : status === 'accepted' ? 'paid' : 'unpaid',
        paidAt: status === 'completed' || status === 'accepted' ? daysAgo(18 - i * 2) : undefined,
        createdAt: daysAgo(25 - i * 2),
        updatedAt: daysAgo(15 - i),
      })
      bookingIds.push({ id: bookingId, bookerId: userIds[bookerIdx], ownerId: service.userId, status })
    }

    // ─── 8. Create Reviews (for completed bookings) ───
    for (const booking of bookingIds) {
      if (booking.status !== 'completed') continue

      await ctx.db.insert('reviews', {
        bookingId: booking.id,
        reviewerId: booking.bookerId,
        revieweeId: booking.ownerId,
        rating: 4 + Math.floor(Math.random() * 2),
        caption: randomFrom([
          'Incredible experience! Highly recommend to everyone.',
          'Super professional and friendly. Would book again!',
          'Exceeded my expectations. Thank you so much!',
          'Great service, very accommodating. 5 stars!',
          'Wonderful experience from start to finish.',
        ]),
        images: [randomFrom(POST_IMAGES)],
        likesCount: Math.floor(Math.random() * 6),
        createdAt: daysAgo(Math.floor(Math.random() * 10)),
      })
    }

    // ─── 9. Create Conversations & Messages ───
    for (let i = 0; i < MESSAGE_THREADS.length; i++) {
      const thread = MESSAGE_THREADS[i]
      const user1 = userIds[i * 2 % userIds.length]
      const user2 = userIds[(i * 2 + 1) % userIds.length]

      const convId = await ctx.db.insert('conversations', {
        participants: [user1, user2],
        lastMessage: thread[thread.length - 1],
        lastMessageAt: hoursAgo(i * 3 + 1),
        lastMessageBy: i % 2 === 0 ? user2 : user1,
        createdAt: daysAgo(15 - i),
        updatedAt: hoursAgo(i * 3 + 1),
      })

      for (let m = 0; m < thread.length; m++) {
        const sender = m % 2 === 0 ? user1 : user2
        await ctx.db.insert('messages', {
          conversationId: convId,
          senderId: sender,
          content: thread[m],
          images: [],
          readBy: [user1, user2],
          createdAt: hoursAgo((thread.length - m) * 2 + i * 10),
        })
      }
    }

    // ─── 10. Create Saved Posts ───
    // Each user saves 2-4 random posts
    for (let i = 0; i < userIds.length; i++) {
      const toSave = randomSubset(postIds, 2, 4)
      for (const postId of toSave) {
        await ctx.db.insert('savedPosts', {
          userId: userIds[i],
          postId,
          createdAt: daysAgo(Math.floor(Math.random() * 14)),
        })
      }
    }

    // ─── 11. Create Notifications ───
    const notifTypes = ['follow', 'post_like', 'comment', 'comment_like', 'booking_accepted']
    for (let i = 0; i < 20; i++) {
      const recipientIdx = i % userIds.length
      let actorIdx = (i + 3) % userIds.length
      if (actorIdx === recipientIdx) actorIdx = (actorIdx + 1) % userIds.length

      const type = notifTypes[i % notifTypes.length]

      await ctx.db.insert('notifications', {
        userId: userIds[recipientIdx],
        type,
        actorId: userIds[actorIdx],
        postId: type === 'post_like' || type === 'comment' ? randomFrom(postIds) : undefined,
        commentId: type === 'comment_like' ? randomFrom(commentIds) : undefined,
        isRead: i > 10,
        createdAt: hoursAgo(i * 4 + Math.floor(Math.random() * 6)),
      })
    }

    return {
      success: true,
      created: {
        users: userIds.length,
        posts: postIds.length,
        comments: commentIds.length,
        services: serviceIds.length,
        bookings: bookingIds.length,
        conversations: MESSAGE_THREADS.length,
        notifications: 20,
      },
    }
  },
})

// ═══════════════════════════════════════
// CLEAR SEED DATA
// ═══════════════════════════════════════
export const clearSeed = internalMutation({
  handler: async (ctx) => {
    // Find seed users
    const allUsers = await ctx.db.query('users').collect()
    const seedUsers = allUsers.filter((u) => u.email.endsWith('@demo.com'))
    const seedUserIds = new Set(seedUsers.map((u) => u._id))

    if (seedUserIds.size === 0) {
      return { error: 'No seed data found.' }
    }

    let deleted = { users: 0, posts: 0, comments: 0, likes: 0, follows: 0, services: 0, bookings: 0, conversations: 0, messages: 0, reviews: 0, notifications: 0, savedPosts: 0 }

    // Delete notifications by/for seed users
    const notifications = await ctx.db.query('notifications').collect()
    for (const n of notifications) {
      if (seedUserIds.has(n.userId) || seedUserIds.has(n.actorId)) {
        await ctx.db.delete(n._id)
        deleted.notifications++
      }
    }

    // Delete saved posts
    const savedPosts = await ctx.db.query('savedPosts').collect()
    for (const sp of savedPosts) {
      if (seedUserIds.has(sp.userId)) {
        await ctx.db.delete(sp._id)
        deleted.savedPosts++
      }
    }

    // Delete reviews
    const reviews = await ctx.db.query('reviews').collect()
    for (const r of reviews) {
      if (seedUserIds.has(r.reviewerId) || seedUserIds.has(r.revieweeId)) {
        await ctx.db.delete(r._id)
        deleted.reviews++
      }
    }

    // Delete messages & conversations
    const conversations = await ctx.db.query('conversations').collect()
    for (const conv of conversations) {
      if (conv.participants.some((p) => seedUserIds.has(p))) {
        const msgs = await ctx.db.query('messages').withIndex('by_conversation', (q) => q.eq('conversationId', conv._id)).collect()
        for (const msg of msgs) {
          await ctx.db.delete(msg._id)
          deleted.messages++
        }
        await ctx.db.delete(conv._id)
        deleted.conversations++
      }
    }

    // Delete bookings
    const bookings = await ctx.db.query('bookings').collect()
    for (const b of bookings) {
      if (seedUserIds.has(b.bookerId) || seedUserIds.has(b.ownerId)) {
        await ctx.db.delete(b._id)
        deleted.bookings++
      }
    }

    // Delete services
    const services = await ctx.db.query('services').collect()
    for (const s of services) {
      if (seedUserIds.has(s.userId)) {
        await ctx.db.delete(s._id)
        deleted.services++
      }
    }

    // Delete follows
    const follows = await ctx.db.query('follows').collect()
    for (const f of follows) {
      if (seedUserIds.has(f.followerId) || seedUserIds.has(f.followingId)) {
        await ctx.db.delete(f._id)
        deleted.follows++
      }
    }

    // Delete likes
    const likes = await ctx.db.query('likes').collect()
    for (const l of likes) {
      if (seedUserIds.has(l.userId)) {
        await ctx.db.delete(l._id)
        deleted.likes++
      }
    }

    // Delete comments on seed user posts
    const posts = await ctx.db.query('posts').collect()
    const seedPostIds = new Set(posts.filter((p) => seedUserIds.has(p.userId)).map((p) => p._id))

    const comments = await ctx.db.query('comments').collect()
    for (const c of comments) {
      if (seedUserIds.has(c.userId) || seedPostIds.has(c.postId)) {
        await ctx.db.delete(c._id)
        deleted.comments++
      }
    }

    // Delete posts
    for (const p of posts) {
      if (seedUserIds.has(p.userId)) {
        await ctx.db.delete(p._id)
        deleted.posts++
      }
    }

    // Delete seed users
    for (const u of seedUsers) {
      await ctx.db.delete(u._id)
      deleted.users++
    }

    return { success: true, deleted }
  },
})
