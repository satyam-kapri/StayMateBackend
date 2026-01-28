import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { createHash } from "crypto";

// Configure faker for Indian data
faker.locale = "en_IND";

const prisma = new PrismaClient();

// Real HD image URLs from Unsplash (free to use)
const maleProfilePhotos = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1506919258185-6078bba55d2a?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=800&h=800&fit=crop",
];

const femaleProfilePhotos = [
  "https://media.istockphoto.com/id/1471725712/photo/smiling-young-woman-taking-selfies-while-relaxing-at-home.jpg?s=612x612&w=0&k=20&c=m-3kAzSQ1hpCfEEO-UtfafjOO0X0IrAlASKP0GFWLMU=",
  "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=800&fit=crop",
];

const otherProfilePhotos = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1542740348-39501cd6e2b4?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1557296387-5358ad7997bb?w=800&h=800&fit=crop",
];

const idDocumentPhotos = {
  AADHAAR:
    "https://img.freepik.com/premium-photo/midsection-man-holding-id-cards_1048944-2784854.jpg?semt=ais_hybrid&w=740&q=80",
  PAN: "https://www.pancardapp.com/blog/wp-content/uploads/2019/04/sample-pan-card.jpg",
  DRIVING_LICENSE:
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Indian_Passport.jpg",
};

const selfiePhotos = [
  "https://img.freepik.com/free-photo/happy-optimistic-woman-with-two-hair-buns-dressed-jacket-enjoys-free-time-walking-city-holds-bottle-detox-drink_273609-55634.jpg?semt=ais_hybrid&w=740&q=80",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrAd1uUrIP0nWpp8-dH1i0LsF1fMTyk5rQ1w&s",
  "https://t3.ftcdn.net/jpg/05/01/01/84/360_F_501018486_SQE0vK8bwMaFAbsHbp5JV2r1rnE1hT9z.jpg",
  "https://media.istockphoto.com/id/1460836430/photo/video-ringing-successful-businessman-looking-at-smartphone-camera-talking-remotely-with.jpg?s=612x612&w=0&k=20&c=-DkYIW3peErREuT-TbO0XgzLSWdvwNKW0DSES5H3TkY=",
];

// Fixed location names as specified
const locationNames = ["Delhi", "Gurugram", "Noida", "Greater Noida"];

const occupations = [
  "Software Engineer",
  "Doctor",
  "Teacher",
  "Designer",
  "Student",
  "Business Owner",
  "Marketing Manager",
  "Architect",
  "Lawyer",
  "CA",
];

// Updated: Only Lifestyle Survey questions
const questionCategories = [
  {
    name: "Lifestyle Survey",
    description: "Questions about habits, preferences, and lifestyle",
    order: 0,
    questions: [
      {
        text: "What is your sleep habit?",
        type: "RADIO",
        order: 0,
        required: true,
        weight: 1.5,
        options: [
          { text: "Early bird", value: "EARLY_BIRD" },
          { text: "Night owl", value: "NIGHT_OWL" },
          { text: "Flexible", value: "FLEXIBLE" },
          { text: "Light sleeper", value: "LIGHT_SLEEPER" },
        ],
      },
      {
        text: "How clean do you keep your space?",
        type: "RADIO",
        order: 1,
        required: true,
        weight: 2.0,
        options: [
          { text: "Very clean", value: "VERY_CLEAN" },
          { text: "Moderately clean", value: "MODERATE" },
          { text: "Relaxed about cleanliness", value: "RELAXED" },
        ],
      },
      {
        text: "What is your smoking preference?",
        type: "RADIO",
        order: 2,
        required: true,
        weight: 2.5,
        options: [
          { text: "Non-smoker", value: "NEVER" },
          { text: "Social smoker", value: "SOMETIMES" },
          { text: "Regular smoker", value: "OFTEN" },
          { text: "Heavy smoker", value: "ALWAYS" },
        ],
      },
      {
        text: "What is your drinking preference?",
        type: "RADIO",
        order: 3,
        required: true,
        weight: 1.5,
        options: [
          { text: "Non-drinker", value: "NEVER" },
          { text: "Social drinker", value: "SOMETIMES" },
          { text: "Regular drinker", value: "OFTEN" },
          { text: "Frequent drinker", value: "ALWAYS" },
        ],
      },
      {
        text: "What is your preference about pets?",
        type: "RADIO",
        order: 4,
        required: true,
        weight: 1.8,
        options: [
          { text: "No pets", value: "NEVER" },
          { text: "Okay with pets", value: "SOMETIMES" },
          { text: "Have pets", value: "OFTEN" },
          { text: "Love pets", value: "ALWAYS" },
        ],
      },
      {
        text: "What is your social vibe?",
        type: "RADIO",
        order: 5,
        required: true,
        weight: 1.2,
        options: [
          { text: "Introverted", value: "NEVER" },
          { text: "Balanced", value: "SOMETIMES" },
          { text: "Social", value: "OFTEN" },
          { text: "Very social", value: "ALWAYS" },
        ],
      },
    ],
  },
];

function generateIndianPhoneNumber() {
  // Generate random Indian phone number starting with +91
  const prefixes = ["98", "97", "96", "99", "90", "91", "92", "93", "94", "95"];
  const prefix = faker.helpers.arrayElement(prefixes);
  const suffix = faker.string.numeric(8);
  return `+91${prefix}${suffix}`;
}

function generateIndianName(gender) {
  if (gender === "MALE") {
    return faker.person.fullName({ sex: "male" });
  } else if (gender === "FEMALE") {
    return faker.person.fullName({ sex: "female" });
  } else {
    return faker.person.fullName();
  }
}

function generateFirebaseUid(email) {
  // Simulate Firebase UID by hashing email
  return createHash("sha256").update(email).digest("hex");
}

function getRandomPhotos(gender) {
  const photoSet =
    gender === "MALE"
      ? maleProfilePhotos
      : gender === "FEMALE"
        ? femaleProfilePhotos
        : otherProfilePhotos;

  // Shuffle and take 3-5 photos
  const shuffled = [...photoSet].sort(() => 0.5 - Math.random());
  const count = faker.number.int({ min: 3, max: 5 });
  return shuffled.slice(0, count);
}

function getRandomKYCIdType() {
  return faker.helpers.arrayElement(["AADHAAR", "PAN", "DRIVING_LICENSE"]);
}

// Helper function to get random lifestyle question responses
function getRandomLifestyleResponse(question, questionData) {
  switch (question.type) {
    case "RADIO":
      // Get options from the questionData (original data) since question object doesn't have options
      const options = questionData.options || [];
      const randomOption = faker.helpers.arrayElement(options);
      return { selectedOptions: [randomOption.value] };

    case "TEXT":
      return { textValue: faker.lorem.sentence() };

    case "NUMBER":
      return { numberValue: faker.number.float({ min: 1, max: 10 }) };

    case "DATE":
      return { dateValue: faker.date.future({ years: 1 }) };

    case "MULTI_SELECT":
      const multiOptions = questionData.options || [];
      const selectedCount = faker.number.int({
        min: 1,
        max: Math.min(3, multiOptions.length),
      });
      const shuffledOptions = [...multiOptions].sort(() => 0.5 - Math.random());
      const selectedOptions = shuffledOptions
        .slice(0, selectedCount)
        .map((opt) => opt.value);
      return { selectedOptions };

    default:
      return {};
  }
}

async function seedLocations() {
  console.log("📍 Seeding locations...");

  // Clear existing locations
  await prisma.location.deleteMany();

  const locations = [];

  for (const locationName of locationNames) {
    const location = await prisma.location.create({
      data: {
        name: locationName,
        isActive: true,
      },
    });
    locations.push(location);
    console.log(`✅ Created location: ${location.name}`);
  }

  return locations;
}

async function seedQuestions() {
  console.log("📝 Seeding lifestyle questions...");

  // Clear existing questions and related data
  await prisma.questionResponse.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionCategory.deleteMany();

  const createdQuestions = [];

  for (const categoryData of questionCategories) {
    // Create category
    const category = await prisma.questionCategory.create({
      data: {
        name: categoryData.name,
        description: categoryData.description,
        order: categoryData.order,
      },
    });

    console.log(`✅ Created category: ${category.name}`);

    // Create questions for this category
    for (const questionData of categoryData.questions) {
      const question = await prisma.question.create({
        data: {
          categoryId: category.id,
          text: questionData.text,
          type: questionData.type,
          order: questionData.order,
          required: questionData.required || false,
          weight: questionData.weight || 1.0,
        },
      });

      // Create options if question has them
      if (questionData.options && questionData.options.length > 0) {
        const optionsData = questionData.options.map((opt, index) => ({
          questionId: question.id,
          text: opt.text,
          value: opt.value,
          order: index,
        }));

        await prisma.option.createMany({
          data: optionsData,
        });
      }

      // Store question with its data for later use
      createdQuestions.push({
        question,
        questionData, // Store the original question data with options
      });
      console.log(
        `   📋 Created question: ${question.text} (weight: ${questionData.weight || 1.0})`,
      );
    }
  }

  return createdQuestions;
}

async function main() {
  console.log("🌱 Starting seed script...");

  // First, seed the locations
  const locations = await seedLocations();

  // Then, seed the lifestyle questions
  const lifestyleQuestionsWithData = await seedQuestions();

  // Clear existing user data
  await prisma.kYCDocument.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.questionResponse.deleteMany(); // Clear existing responses
  // Need to clear the relationship table first before profiles
  await prisma.$executeRaw`DELETE FROM "_PreferredLocations"`;
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const users = [];
  const profiles = [];
  const photos = [];
  const kycDocuments = [];
  const questionResponses = [];

  // Create 20 users
  for (let i = 0; i < 20; i++) {
    const gender = faker.helpers.arrayElement(["MALE", "FEMALE", "OTHER"]);
    const phone = generateIndianPhoneNumber();
    const email = faker.internet.email().toLowerCase();
    const firebaseUid = generateFirebaseUid(email);
    const name = generateIndianName(gender);
    const age = faker.number.int({ min: 21, max: 35 });

    // Generate budget and location data
    const budgetMin = faker.number.float({
      min: 8000,
      max: 20000,
      precision: 1000,
    });
    const budgetMax = faker.number.float({
      min: budgetMin + 5000,
      max: 40000,
      precision: 1000,
    });

    // Select 1-3 random locations for this user
    const selectedLocations = faker.helpers.arrayElements(locations, {
      min: 1,
      max: 3,
    });

    const moveInDate = faker.datatype.boolean(0.7)
      ? faker.date.future({ years: 0.5 })
      : null;

    // Create User
    const user = await prisma.user.create({
      data: {
        phone,
        firebaseUid,
        isVerified: faker.datatype.boolean(0.7), // 70% verified
        premiumStatus: faker.helpers.arrayElement(["FREE", "PREMIUM"]),
        status: faker.helpers.arrayElement(["PENDING", "VERIFIED", "FLAGGED"]),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: faker.date.recent(),
      },
    });

    users.push(user);

    // Create Profile with budget (location connection will be added later)
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        name,
        age,
        gender,
        occupation: faker.helpers.arrayElement(occupations),
        bio: faker.lorem.sentences(2),
        // Budget columns
        budgetMin,
        budgetMax,
        moveInDate,
        currentStep: faker.number.int({ min: 0, max: 5 }),
        lastSeen: faker.date.recent(),
      },
    });

    profiles.push(profile);

    // Connect profile to selected locations
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        preferredLocations: {
          connect: selectedLocations.map((loc) => ({ id: loc.id })),
        },
      },
    });

    // Create lifestyle question responses for this profile
    for (const { question, questionData } of lifestyleQuestionsWithData) {
      const response = getRandomLifestyleResponse(question, questionData);

      const questionResponse = await prisma.questionResponse.create({
        data: {
          profileId: profile.id,
          questionId: question.id,
          textValue: response.textValue || null,
          numberValue: response.numberValue || null,
          dateValue: response.dateValue || null,
          selectedOptions: response.selectedOptions || [],
        },
      });

      questionResponses.push(questionResponse);
    }

    // Create Photos for Profile
    const profilePhotos = getRandomPhotos(gender);
    for (let j = 0; j < profilePhotos.length; j++) {
      const photo = await prisma.photo.create({
        data: {
          profileId: profile.id,
          url: profilePhotos[j],
          order: j,
        },
      });
      photos.push(photo);
    }

    // Create KYC Document for 80% of users
    if (faker.datatype.boolean(0.8)) {
      const idType = getRandomKYCIdType();
      const kyc = await prisma.kYCDocument.create({
        data: {
          userId: user.id,
          idType,
          idFrontUrl: idDocumentPhotos[idType],
          idBackUrl: idDocumentPhotos[idType],
          selfieUrl: faker.helpers.arrayElement(selfiePhotos),
          status: faker.helpers.arrayElement([
            "PENDING",
            "VERIFIED",
            "FLAGGED",
          ]),
          step: faker.number.int({ min: 0, max: 3 }),
          rejectionReason: faker.datatype.boolean(0.2)
            ? faker.lorem.sentence()
            : null,
          submittedAt: faker.date.past({ years: 0.5 }),
          reviewedAt: faker.datatype.boolean(0.4) ? faker.date.recent() : null,
          reviewerId: faker.datatype.boolean(0.3) ? faker.string.uuid() : null,
        },
      });

      kycDocuments.push(kyc);
    }

    const locationNamesList = selectedLocations
      .map((loc) => loc.name)
      .join(", ");

    console.log(`✅ Created user ${i + 1}: ${name} (${phone})`);
    console.log(`   Budget: ₹${budgetMin} - ₹${budgetMax}`);
    console.log(`   Locations: ${locationNamesList}`);
  }

  console.log("\n📊 Seed Summary:");
  console.log(`📍 Locations: ${locations.length}`);
  console.log(`👥 Users: ${users.length}`);
  console.log(`📝 Profiles: ${profiles.length}`);
  console.log(`📋 Lifestyle Questions: ${lifestyleQuestionsWithData.length}`);
  console.log(`🗳️ Lifestyle Responses: ${questionResponses.length}`);
  console.log(`📸 Photos: ${photos.length}`);
  console.log(`🆔 KYC Documents: ${kycDocuments.length}`);
  console.log("\n✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
