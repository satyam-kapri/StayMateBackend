import {
  PrismaClient,
  Gender,
  PreferenceLevel,
  PremiumStatus,
} from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// High-quality image URLs by gender
const getProfileImageUrls = (gender, count = 2) => {
  const baseUrls = {
    [Gender.MALE]: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w-400&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507591064344-4c6ce005-128?w=400&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    ],
    [Gender.FEMALE]: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    ],
    [Gender.OTHER]: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    ],
  };

  const urls = baseUrls[gender];
  const selected = new Set();

  while (selected.size < count && selected.size < urls.length) {
    selected.add(urls[Math.floor(Math.random() * urls.length)]);
  }

  return Array.from(selected);
};

// Indian cities with realistic rental prices
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

// Common Indian professions
const indianOccupations = [
  "Software Engineer",
  "Data Analyst",
  "Marketing Manager",
  "Product Manager",
  "Doctor",
  "CA",
  "Teacher",
  "Graphic Designer",
  "Content Writer",
  "Sales Executive",
  "Business Analyst",
  "Architect",
  "Lawyer",
  "Financial Advisor",
  "HR Manager",
  "Operations Manager",
  "Research Scientist",
  "Consultant",
  "Entrepreneur",
];

// Indian first names by gender
const getIndianName = (gender) => {
  const maleFirstNames = [
    "Rahul",
    "Raj",
    "Amit",
    "Vikram",
    "Suresh",
    "Rohan",
    "Arjun",
    "Karan",
    "Aditya",
    "Sanjay",
    "Deepak",
    "Manoj",
    "Nikhil",
    "Prateek",
    "Vishal",
  ];

  const femaleFirstNames = [
    "Priya",
    "Anjali",
    "Neha",
    "Ritu",
    "Sonia",
    "Divya",
    "Pooja",
    "Meera",
    "Kavita",
    "Shreya",
    "Aditi",
    "Swati",
    "Nisha",
    "Tanvi",
    "Isha",
  ];

  const otherFirstNames = [...maleFirstNames, ...femaleFirstNames];
  const lastNames = [
    "Sharma",
    "Verma",
    "Patel",
    "Singh",
    "Kumar",
    "Gupta",
    "Joshi",
    "Reddy",
    "Das",
    "Nair",
    "Menon",
    "Choudhary",
    "Malhotra",
    "Saxena",
    "Kapoor",
  ];

  const firstNames =
    gender === Gender.MALE
      ? maleFirstNames
      : gender === Gender.FEMALE
      ? femaleFirstNames
      : otherFirstNames;

  return {
    firstName: faker.helpers.arrayElement(firstNames),
    lastName: faker.helpers.arrayElement(lastNames),
  };
};

async function main() {
  console.log("🧹 Cleaning database...");

  // Use transaction for better performance
  await prisma.$transaction([
    prisma.photo.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.match.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("🌱 Seeding 20 users...");

  const genders = Object.values(Gender);
  const prefLevels = Object.values(PreferenceLevel);

  for (let i = 0; i < 20; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const { firstName, lastName } = getIndianName(gender);
    const fullName = `${firstName} ${lastName}`;

    // Generate realistic Indian phone number
    const indianPhone = `+91${faker.string.numeric({
      length: 10,
      allowLeadingZeros: false,
    })}`;

    // Select realistic city and budget
    const city = faker.helpers.arrayElement(indianCities);
    const preferredAreas = faker.helpers.arrayElements(
      indianCities.map((c) => c.name),
      { min: 1, max: 3 }
    );

    // Calculate realistic budget based on selected areas
    const areaStats = indianCities.filter((c) =>
      preferredAreas.includes(c.name)
    );
    const budgetMin = Math.min(...areaStats.map((a) => a.minRent));
    const budgetMax = Math.max(...areaStats.map((a) => a.maxRent)) * 1.2; // 20% buffer

    // Get gender-specific images
    const photoUrls = getProfileImageUrls(
      gender,
      faker.number.int({ min: 1, max: 3 })
    );

    // Create User with Profile and Photos
    await prisma.user.create({
      data: {
        phone: indianPhone,
        firebaseUid: faker.string.uuid(),
        isVerified: faker.datatype.boolean(0.8), // 80% verified
        premiumStatus: faker.helpers.arrayElement([
          PremiumStatus.FREE,
          PremiumStatus.PREMIUM,
          PremiumStatus.ULTRA_PREMIUM,
        ]),
        createdAt: faker.date.recent({ days: 30 }),

        profile: {
          create: {
            name: fullName,
            age: faker.number.int({ min: 21, max: 35 }), // More realistic age range
            gender,
            occupation: faker.helpers.arrayElement(indianOccupations),
            bio: faker.lorem.sentences({ min: 1, max: 2 }),
            budgetMin: Math.round(budgetMin / 1000) * 1000, // Round to nearest 1000
            budgetMax: Math.round(budgetMax / 1000) * 1000,
            preferredAreas,
            moveInDate: faker.date.between({
              from: new Date(),
              to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Within 60 days
            }),

            // Lifestyle Survey with weighted preferences
            sleepHabit: faker.helpers.weightedArrayElement([
              { weight: 40, value: PreferenceLevel.YES }, // 40% early risers
              { weight: 30, value: PreferenceLevel.NO }, // 30% night owls
              { weight: 30, value: PreferenceLevel.SOMETIMES },
            ]),
            cleanliness: faker.helpers.weightedArrayElement([
              { weight: 60, value: PreferenceLevel.YES }, // 60% prefer clean
              { weight: 20, value: PreferenceLevel.NO },
              { weight: 20, value: PreferenceLevel.SOMETIMES },
            ]),
            smoking: faker.helpers.weightedArrayElement([
              { weight: 80, value: PreferenceLevel.NO }, // 80% non-smokers
              { weight: 15, value: PreferenceLevel.SOMETIMES },
              { weight: 5, value: PreferenceLevel.YES },
            ]),
            drinking: faker.helpers.weightedArrayElement([
              { weight: 40, value: PreferenceLevel.NO }, // 40% teetotalers
              { weight: 40, value: PreferenceLevel.SOMETIMES },
              { weight: 20, value: PreferenceLevel.YES },
            ]),
            pets: faker.helpers.weightedArrayElement([
              { weight: 30, value: PreferenceLevel.YES },
              { weight: 50, value: PreferenceLevel.SOMETIMES },
              { weight: 20, value: PreferenceLevel.NO },
            ]),
            socialVibe: faker.helpers.weightedArrayElement([
              { weight: 40, value: PreferenceLevel.YES }, // 40% social
              { weight: 30, value: PreferenceLevel.SOMETIMES },
              { weight: 30, value: PreferenceLevel.NO },
            ]),

            currentStep: 5,

            // Photos with gender-specific images
            photos: {
              create: photoUrls.map((url, index) => ({
                url,
                order: index,
              })),
            },
          },
        },
      },
    });

    // Progress indicator
    if ((i + 1) % 5 === 0) {
      console.log(`   Created ${i + 1} users...`);
    }
  }

  console.log("✅ Seeding complete!");
  console.log(`🎯 Created 20 users with realistic Indian data`);
  console.log(`📸 Used gender-specific high-quality images`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
