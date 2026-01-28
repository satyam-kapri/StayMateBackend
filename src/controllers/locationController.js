// controllers/adminLocationController.js

import prisma from "../../prisma/client.js";
export const getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });

    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
};

export const getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    res.json({
      success: true,
      location,
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch location",
    });
  }
};

export const createLocation = async (req, res) => {
  try {
    const { name, isActive = true } = req.body;

    // Check if location with same name exists
    const existingLocation = await prisma.location.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: "Location with this name already exists",
      });
    }

    const location = await prisma.location.create({
      data: {
        name,
        isActive,
      },
    });

    res.json({
      success: true,
      location,
      message: "Location created successfully",
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create location",
    });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    // Check if new name conflicts with other location
    if (name && name !== existingLocation.name) {
      const nameConflict = await prisma.location.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          NOT: { id },
        },
      });

      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: "Location with this name already exists",
        });
      }
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name,
        isActive,
      },
    });

    res.json({
      success: true,
      location: updatedLocation,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update location",
    });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    // Delete location (Prisma will handle the many-to-many relationship cascade)
    await prisma.location.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete location",
    });
  }
};

export const checkLocationUsage = async (req, res) => {
  try {
    const { id } = req.params;

    // Count profiles using this location
    const usageCount = await prisma.profile.count({
      where: {
        preferredLocations: {
          some: { id },
        },
      },
    });

    res.json({
      success: true,
      isInUse: usageCount > 0,
      userCount: usageCount,
    });
  } catch (error) {
    console.error("Error checking location usage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check location usage",
    });
  }
};
