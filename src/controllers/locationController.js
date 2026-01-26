import prisma from "../../prisma/client.js";

/**
 * GET /api/locations
 * Get all active locations
 */
export const getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    res.json({ success: true, locations });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch locations" });
  }
};

/**
 * POST /api/admin/locations
 * Create new location (Admin only)
 */
export const createLocation = async (req, res) => {
  try {
    const { name, description, order } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Location name is required" });
    }

    const existingLocation = await prisma.location.findUnique({
      where: { name },
    });

    if (existingLocation) {
      return res
        .status(400)
        .json({ success: false, message: "Location already exists" });
    }

    const location = await prisma.location.create({
      data: {
        name,
        description,
        order: order || 0,
      },
    });

    res.json({ success: true, location });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create location" });
  }
};

/**
 * PUT /api/admin/locations/:id
 * Update location (Admin only)
 */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order, isActive } = req.body;

    const location = await prisma.location.update({
      where: { id },
      data: {
        name,
        description,
        order,
        isActive,
      },
    });

    res.json({ success: true, location });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update location" });
  }
};

/**
 * DELETE /api/admin/locations/:id
 * Delete location (soft delete - Admin only)
 */
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false
    await prisma.location.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true, message: "Location deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete location" });
  }
};

/**
 * GET /api/admin/locations/all
 * Get all locations including inactive (Admin only)
 */
export const getAllLocationsAdmin = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    res.json({ success: true, locations });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch locations" });
  }
};
