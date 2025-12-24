import prisma from "../../prisma/client.js";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/** ───────────── Helpers (simple inline validation) ───────────── */
const isIsoDate = (v) => typeof v === "string" && !Number.isNaN(Date.parse(v));

const validateCreate = (body) => {
  const errors = [];
  if (!body?.userId) errors.push("userId is required");
  if (!body?.name) errors.push("name is required");
  if (typeof body?.age !== "number") errors.push("age must be a number");
  if (!["MALE", "FEMALE", "OTHER"].includes(body?.gender)) errors.push("gender must be MALE|FEMALE|OTHER");
  if (typeof body?.budgetMin !== "number") errors.push("budgetMin must be a number");
  if (typeof body?.budgetMax !== "number") errors.push("budgetMax must be a number");
  if (body?.budgetMin > body?.budgetMax) errors.push("budgetMin must be <= budgetMax");
  if (body?.moveInDate && !isIsoDate(body.moveInDate)) errors.push("moveInDate must be ISO date string");
  if (body?.lastSeen && !isIsoDate(body.lastSeen)) errors.push("lastSeen must be ISO date string");
  return errors;
};

const validateUpdate = (body) => {
  const errors = [];
  if (body?.gender && !["MALE", "FEMALE", "OTHER"].includes(body.gender)) errors.push("gender must be MALE|FEMALE|OTHER");
  if (body?.sleepHabit && !["EARLY_BIRD", "NIGHT_OWL"].includes(body.sleepHabit)) errors.push("sleepHabit must be EARLY_BIRD|NIGHT_OWL");
  if (body?.cleanliness && !["HIGH", "MEDIUM", "LOW"].includes(body.cleanliness)) errors.push("cleanliness must be HIGH|MEDIUM|LOW");
  if (body?.socialVibe && !["QUIET", "SOCIAL"].includes(body.socialVibe)) errors.push("socialVibe must be QUIET|SOCIAL");
  if (body?.moveInDate && !isIsoDate(body.moveInDate)) errors.push("moveInDate must be ISO date string");
  if (body?.lastSeen && !isIsoDate(body.lastSeen)) errors.push("lastSeen must be ISO date string");
  if (body?.budgetMin !== undefined && typeof body.budgetMin !== "number") errors.push("budgetMin must be a number");
  if (body?.budgetMax !== undefined && typeof body.budgetMax !== "number") errors.push("budgetMax must be a number");
  if (body?.budgetMin !== undefined && body?.budgetMax !== undefined && body.budgetMin > body.budgetMax) {
    errors.push("budgetMin must be <= budgetMax");
  }
  return errors;
};

/** ───────────── Controllers ───────────── */

// CREATE Profile
exports.createProfile = async (req, res) => {
  const errors = validateCreate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const d = req.body;

  // Ensure user exists
  const user = await prisma.user.findUnique({ where: { id: d.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  try {
    const profile = await prisma.profile.create({
      data: {
        userId: d.userId,
        name: d.name,
        age: d.age,
        gender: d.gender,
        occupation: d.occupation ?? null,
        bio: d.bio ?? null,

        budgetMin: d.budgetMin,
        budgetMax: d.budgetMax,
        preferredAreas: Array.isArray(d.preferredAreas) ? d.preferredAreas : [],
        moveInDate: d.moveInDate ? new Date(d.moveInDate) : null,

        sleepHabit: d.sleepHabit ?? null,
        cleanliness: d.cleanliness ?? null,
        smoking: d.smoking ?? false,
        drinking: d.drinking ?? false,
        pets: d.pets ?? false,
        socialVibe: d.socialVibe ?? null,

        lastSeen: d.lastSeen ? new Date(d.lastSeen) : null,
      },
    });
    return res.status(201).json(profile);
  } catch (e) {
    // P2002 = unique constraint violation (e.g., userId unique)
    if (e?.code === "P2002") return res.status(409).json({ error: "Profile already exists for this user" });
    return res.status(500).json({ error: "Server error", details: e?.message });
  }
};

// LIST Profiles (filters: gender, area, minBudget, maxBudget)
exports.listProfiles = async (req, res) => {
  const { limit = "20", offset = "0", gender, area, minBudget, maxBudget } = req.query;

  const where = {};
  if (gender) where.gender = gender;
  if (area) where.preferredAreas = { has: area }; // array contains
  if (minBudget || maxBudget) {
    where.AND = [
      ...(minBudget ? [{ budgetMin: { gte: Number(minBudget) } }] : []),
      ...(maxBudget ? [{ budgetMax: { lte: Number(maxBudget) } }] : []),
    ];
  }

  try {
    const profiles = await prisma.profile.findMany({
      where,
      take: Math.min(Number(limit) || 20, 100),
      skip: Number(offset) || 0,
      orderBy: { updatedAt: "desc" },
    });
    return res.json(profiles);
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: e?.message });
  }
};

// GET Profile by id
exports.getProfileById = async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { id: req.params.id } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  return res.json(profile);
};

// GET Profile by userId (1:1)
exports.getProfileByUserId = async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.params.userId } });
  if (!profile) return res.status(404).json({ error: "Profile not found for user" });
  return res.json(profile);
};

// UPDATE Profile (partial)
exports.updateProfile = async (req, res) => {
  const errors = validateUpdate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const d = req.body;

  try {
    const updated = await prisma.profile.update({
      where: { id: req.params.id },
      data: {
        ...(d.name !== undefined ? { name: d.name } : {}),
        ...(d.age !== undefined ? { age: d.age } : {}),
        ...(d.gender !== undefined ? { gender: d.gender } : {}),
        ...(d.occupation !== undefined ? { occupation: d.occupation } : {}),
        ...(d.bio !== undefined ? { bio: d.bio } : {}),

        ...(d.budgetMin !== undefined ? { budgetMin: d.budgetMin } : {}),
        ...(d.budgetMax !== undefined ? { budgetMax: d.budgetMax } : {}),
        ...(d.preferredAreas !== undefined ? { preferredAreas: d.preferredAreas } : {}),
        ...(d.moveInDate !== undefined ? { moveInDate: d.moveInDate ? new Date(d.moveInDate) : null } : {}),

        ...(d.sleepHabit !== undefined ? { sleepHabit: d.sleepHabit } : {}),
        ...(d.cleanliness !== undefined ? { cleanliness: d.cleanliness } : {}),
        ...(d.smoking !== undefined ? { smoking: d.smoking } : {}),
        ...(d.drinking !== undefined ? { drinking: d.drinking } : {}),
        ...(d.pets !== undefined ? { pets: d.pets } : {}),
        ...(d.socialVibe !== undefined ? { socialVibe: d.socialVibe } : {}),
        ...(d.lastSeen !== undefined ? { lastSeen: d.lastSeen ? new Date(d.lastSeen) : null } : {}),
      },
    });
    return res.json(updated);
  } catch (e) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Profile not found" });
    return res.status(500).json({ error: "Server error", details: e?.message });
  }
};

// DELETE Profile
exports.deleteProfile = async (req, res) => {
  try {
    await prisma.profile.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (e) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Profile not found" });
    return res.status(500).json({ error: "Server error", details: e?.message });
  }
};
