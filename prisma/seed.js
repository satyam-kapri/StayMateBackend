import {
  PrismaClient,
  Gender,
  PreferenceLevel,
  PremiumStatus,
} from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// ------------------------------------------------------------------
// 1. CURATED IMAGE POOLS (High Quality Portraits)
// ------------------------------------------------------------------

// Specific Unsplash Image IDs to ensure high quality & realistic faces
const MALE_IMAGE_IDS = [
  "Mt7l7kHe33k", "iFgRcqHznqg", "7YVZYZeITc8", "WNoLnJo7tS8",
  "dANjuKw5XFk", "IF9TK5Uy-KI", "ilW1iB9uXUQ", "poZIJp2178s",
  "5aGUyCW_PJw", "6Nub980bI3I", "mEZ3PoFGs_k", "ZHvM3XIOHoE",
  "DItYlc26zVI", "rDEOVtE7vOs", "cdksyTqBeU0", "O3ymvT7Wf9U",
  "jmURdhtm7k4", "Yn57cJC4D5E", "aQcE3gDSzbw", "8PMvB42mCUc",
  "C8Ta0gwPbQg", "AG712I-jEFE", "NTPyJPj5mIQ", "t6BUn_WbE94"
];

const FEMALE_IMAGE_IDS = [
  "9UVmlIb0wJU", "jzz_33GNpnM", "AB6502DBHj8", "rDEOVtE7vOs",
  "bRC7rWnO3xY", "FVh_yqLR9eA", "0fN7Fxv1eWA", "QXevDflbl8A",
  "u3WmDy54tpY", "X6Uj51n5CE8", "Zz5LQe-VSMY", "Tjbk79XB82M",
  "cnCVj-2F6nU", "c_GmwfHBDzk", "DLKR_x3T_7s", "AZ60iF1Zc_I",
  "pAtA8xe_iVM", "vSuQ1_24hFA", "dZ4Yj8h0Qf0", "W7b3eDUb_2I",
  "6Whd7pqw3DA", "n4KewLKFOZw", "rriAI0nhcbc", "XQWxrCLwvQA"
];

// Helper to construct URL
const makeUrl = (id: string) => 
  `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&crop=faces&q=80`;

// Fisher-Yates Shuffle to randomize the pool order
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// ------------------------------------------------------------------
// 2. DATA CONSTANTS
// ------------------------------------------------------------------

const indianCities = [
  { name: "Delhi", minRent: 8000, maxRent: 30000 },
  { name: "Gurugram", minRent: 10000, maxRent: 35000 },
  { name: "Noida", minRent: 7000, maxRent: 25000 },
  { name: "Greater Noida", minRent: 6000, maxRent: 18000 },
  { name: "Bangalore", minRent: 12000, maxRent: 40000 },
  { name: "Mumbai", minRent: 15000, maxRent: 50000 },
  { name: "Hyderabad", minRent: 9000, maxRent: 28000 },
  { name: "Pune", minRent: 8000, maxRent: 30000 },
];

const indianOccupations = [
  "Software Engineer", "Data Analyst", "Marketing Manager", "Product Manager",
  "Doctor", "CA", "Teacher", "Graphic Designer", "Content Writer",
  "Sales Executive", "Business Analyst", "Architect", "Lawyer",
  "Financial Advisor", "HR Manager", "UX Designer", "Civil Engineer"
];

const getIndianName = (gender: Gender) => {
  const maleFirstNames = [
    "Rahul", "Raj", "Amit", "Vikram", "Suresh", "Rohan", "Arjun", "Karan",
    "Aditya", "Sanjay", "Deepak", "Manoj", "Nikhil", "Prateek", "Vishal",
    "Kabir", "Aryan", "Dhruv", "Ishaan", "Vihaan"
  ];

  const femaleFirstNames = [
    "Priya", "Anjali", "Neha", "Ritu", "Sonia", "Divya", "Pooja", "Meera",
    "Kavita", "Shreya", "Aditi", "Swati", "Nisha", "Tanvi", "Isha",
    "Anya", "Diya", "Ananya", "Zara", "Sana"
  ];

  const lastNames = [
    "Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Joshi", "Reddy",
    "Das", "Nair", "Menon", "Choudhary", "Malhotra", "Saxena", "Kapoor",
    "Bhatia", "Mehta", "Jain", "Aggarwal", "Iyer"
  ];

  const firstNames = gender === Gender.MALE ? maleFirstNames : femaleFirstNames;

  return {
    firstName: faker.helpers.arrayElement(firstNames),
    lastName: faker.helpers.arrayElement(lastNames),
  };
};

// ------------------------------------------------------------------
// 3. MAIN SCRIPT
// ------------------------------------------------------------------

async function main() {
  console.log("🧹 Cleaning database...");
  await prisma.$transaction([
    prisma.photo.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.match.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("🌱 Preparing image pools...");
  // Shuffle pools once at the start so we can "pop" unique images
  const availableMaleImages = shuffleArray(MALE_IMAGE_IDS);
  const availableFemaleImages = shuffleArray(FEMALE_IMAGE_IDS);
  
  // Create a pool for "Other" gender mixing both
  const availableOtherImages = shuffleArray([...MALE_IMAGE_IDS, ...FEMALE_IMAGE_IDS]);

  console.log("🚀 Seeding 20 users...");
  const genders = Object.values(Gender);

  for (let i = 0; i < 20; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const { firstName, lastName } = getIndianName(gender);
    const fullName = `${firstName} ${lastName}`;

    // --- NON-REPEATING IMAGE LOGIC ---
    // We try to take an image from the pool. If pool is empty, we fallback to random
    let selectedImageIds: string[] = [];
    const numPhotos = faker.number.int({ min: 2, max: 4 });

    for (let p = 0; p < numPhotos; p++) {
      let imgId;
      if (gender === Gender.MALE && availableMaleImages.length > 0) {
        imgId = availableMaleImages.pop();
      } else if (gender === Gender.FEMALE && availableFemaleImages.length > 0) {
        imgId = availableFemaleImages.pop();
      } else if (gender === Gender.OTHER && availableOtherImages.length > 0) {
        imgId = availableOtherImages.pop();
      } else {
        // Fallback if we run out of unique predefined images
        imgId = faker.helpers.arrayElement(
          gender === Gender.MALE ? MALE_IMAGE_IDS : FEMALE_IMAGE_IDS
        );
      }
      if (imgId) selectedImageIds.push(imgId);
    }
    // ---------------------------------

    const indianPhone = `+91${faker.string.numeric({ length: 10, allowLeadingZeros: false })}`;
    const city = faker.helpers.arrayElement(indianCities);
    const preferredAreas = faker.helpers.arrayElements(indianCities.map((c) => c.name), { min: 1, max: 3 });

    // Budget Logic
    const areaStats = indianCities.filter((c) => preferredAreas.includes(c.name));
    const budgetMin = Math.min(...areaStats.map((a) => a.minRent));
    const budgetMax = Math.max(...areaStats.map((a) => a.maxRent)) * 1.2;

    await prisma.user.create({
      data: {
        phone: indianPhone,
        firebaseUid: faker.string.uuid(),
        isVerified: faker.datatype.boolean(0.8),
        premiumStatus: faker.helpers.arrayElement([
          PremiumStatus.FREE,
          PremiumStatus.PREMIUM,
          PremiumStatus.ULTRA_PREMIUM,
        ]),
        createdAt: faker.date.recent({ days: 30 }),

        profile: {
          create: {
            name: fullName,
            age: faker.number.int({ min: 21, max: 32 }),
            gender,
            occupation: faker.helpers.arrayElement(indianOccupations),
            bio: faker.lorem.sentences({ min: 1, max: 2 }),
            budgetMin: Math.round(budgetMin / 1000) * 1000,
            budgetMax: Math.round(budgetMax / 1000) * 1000,
            preferredAreas,
            moveInDate: faker.date.between({
              from: new Date(),
              to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            }),
            
            // Preferences
            sleepHabit: faker.helpers.arrayElement(Object.values(PreferenceLevel)),
            cleanliness: faker.helpers.weightedArrayElement([
                { weight: 70, value: PreferenceLevel.YES }, 
                { weight: 30, value: PreferenceLevel.SOMETIMES }
            ]),
            smoking: faker.helpers.weightedArrayElement([
                { weight: 80, value: PreferenceLevel.NO }, 
                { weight: 20, value: PreferenceLevel.YES }
            ]),
            drinking: faker.helpers.arrayElement(Object.values(PreferenceLevel)),
            pets: faker.helpers.arrayElement(Object.values(PreferenceLevel)),
            socialVibe: faker.helpers.arrayElement(Object.values(PreferenceLevel)),
            
            currentStep: 5,

            // Create Photos
            photos: {
              create: selectedImageIds.map((id, index) => ({
                url: makeUrl(id),
                order: index,
              })),
            },
          },
        },
      },
    });

    if ((i + 1) % 5 === 0) console.log(`   Created ${i + 1} users...`);
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
