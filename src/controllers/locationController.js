// locationController.js
import prisma from "../../prisma/client.js";
export const getLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, locations });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch locations" });
  }
};

export const createLocation = async (req, res) => {
  try {
    const { name } = req.body;
    const location = await prisma.location.create({
      data: { name },
    });
    res.json({ success: true, location });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create location" });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;
    const location = await prisma.location.update({
      where: { id },
      data: { name, isActive },
    });
    res.json({ success: true, location });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update location" });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if location is used in any profiles
    const profilesWithLocation = await prisma.profile.count({
      where: {
        preferredLocations: {
          some: { id },
        },
      },
    });

    if (profilesWithLocation > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete location that is in use",
      });
    }

    await prisma.location.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete location" });
  }
};
