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
  aadhaar:
    "https://img.freepik.com/premium-photo/midsection-man-holding-id-cards_1048944-2784854.jpg?semt=ais_hybrid&w=740&q=80",
  pan: "https://www.pancardapp.com/blog/wp-content/uploads/2019/04/sample-pan-card.jpg",
  passport:
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Indian_Passport.jpg",
};

const selfiePhotos = [
  "https://img.freepik.com/free-photo/happy-optimistic-woman-with-two-hair-buns-dressed-jacket-enjoys-free-time-walking-city-holds-bottle-detox-drink_273609-55634.jpg?semt=ais_hybrid&w=740&q=80",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrAd1uUrIP0nWpp8-dH1i0LsF1fMTyk5rQ1w&s",
  "https://t3.ftcdn.net/jpg/05/01/01/84/360_F_501018486_SQE0vK8bwMaFAbsHbp5JV2r1rnE1hT9z.jpg",
  "https://media.istockphoto.com/id/1460836430/photo/video-ringing-successful-businessman-looking-at-smartphone-camera-talking-remotely-with.jpg?s=612x612&w=0&k=20&c=-DkYIW3peErREuT-TbO0XgzLSWdvwNKW0DSES5H3TkY=",
];

const preferredAreas = ["Delhi", "Gurgaon", "Noida", "Greater Noida"];
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

async function main() {
  console.log("🌱 Starting seed script...");

  // Clear existing data
  await prisma.kYCDocument.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const users = [];
  const profiles = [];
  const photos = [];
  const kycDocuments = [];

  // Create 20 users
  for (let i = 0; i < 20; i++) {
    const gender = faker.helpers.arrayElement(["MALE", "FEMALE", "OTHER"]);
    const phone = generateIndianPhoneNumber();
    const email = faker.internet.email().toLowerCase();
    const firebaseUid = generateFirebaseUid(email);
    const name = generateIndianName(gender);
    const age = faker.number.int({ min: 21, max: 35 });

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

    // Create Profile
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        name,
        age,
        gender,
        occupation: faker.helpers.arrayElement(occupations),
        bio: faker.lorem.sentences(2),
        budgetMin: faker.number.float({
          min: 8000,
          max: 20000,
          precision: 1000,
        }),
        budgetMax: faker.number.float({
          min: 15000,
          max: 40000,
          precision: 1000,
        }),
        preferredAreas: faker.helpers.arrayElements(preferredAreas, {
          min: 1,
          max: 3,
        }),
        moveInDate: faker.date.future({ years: 0.5 }),
        sleepHabit: faker.helpers.arrayElement(["NO", "SOMETIMES", "YES"]),
        cleanliness: faker.helpers.arrayElement(["NO", "SOMETIMES", "YES"]),
        smoking: faker.helpers.arrayElement(["NO", "SOMETIMES", "YES"]),
        drinking: faker.helpers.arrayElement(["NO", "SOMETIMES", "YES"]),
        pets: faker.helpers.arrayElement(["NO", "SOMETIMES", "YES"]),
        socialVibe: faker.helpers.arrayElement(["NO", "SOMETIMES", "YES"]),
        currentStep: faker.number.int({ min: 0, max: 5 }),
        lastSeen: faker.date.recent(),
      },
    });

    profiles.push(profile);

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
          idBackUrl: faker.datatype.boolean(0.5)
            ? idDocumentPhotos[idType]
            : null,
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

    console.log(`✅ Created user ${i + 1}: ${name} (${phone})`);
  }

  console.log("\n📊 Seed Summary:");
  console.log(`👥 Users: ${users.length}`);
  console.log(`📝 Profiles: ${profiles.length}`);
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
