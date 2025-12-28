const prisma = require("../prismaClient");

// ===============================
// GET PROPERTIES WITH FILTERS
// GET /api/properties
// ===============================
exports.getProperties = async (req, res) => {
  try {
    const {
      propertyType,
      listingType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      condition,
      page = 1,
      limit = 12,
    } = req.query;

    const where = {
      status: "AVAILABLE",
      propertyType: propertyType || undefined,
      listingType: listingType || undefined,
      city: city ? { contains: city, mode: "insensitive" } : undefined,
      condition: condition || undefined,
      bedrooms: bedrooms ? { gte: Number(bedrooms) } : undefined,
      bathrooms: bathrooms ? { gte: Number(bathrooms) } : undefined,
      price: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
      area: {
        gte: minArea ? Number(minArea) : undefined,
        lte: maxArea ? Number(maxArea) : undefined,
      },
    };

    const properties = await prisma.property.findMany({
      where,
      skip: (page - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.property.count({ where });

    res.json({
      properties,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("getProperties error:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

// ===============================
// GET SINGLE PROPERTY
// GET /api/properties/:id
// ===============================
exports.getPropertyById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const property = await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json(property);
  } catch (error) {
    res.status(404).json({ message: "Property not found" });
  }
};

// ===============================
// CREATE PROPERTY
// POST /api/properties
// ===============================
exports.createProperty = async (req, res) => {
  try {
    const data = req.body;

    const property = await prisma.property.create({
      data: {
        ...data,
        status: "AVAILABLE",
      },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("createProperty error:", error);
    res.status(500).json({ message: "Failed to create property" });
  }
};

// ===============================
// UPDATE PROPERTY
// PUT /api/properties/:id
// ===============================
exports.updateProperty = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const property = await prisma.property.update({
      where: { id },
      data: req.body,
    });

    res.json(property);
  } catch (error) {
    res.status(404).json({ message: "Property not found" });
  }
};

// ===============================
// DELETE PROPERTY
// DELETE /api/properties/:id
// ===============================
exports.deleteProperty = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.property.delete({ where: { id } });

    res.json({ message: "Property removed" });
  } catch (error) {
    res.status(404).json({ message: "Property not found" });
  }
};

// ===============================
// FEATURED PROPERTIES
// GET /api/properties/featured
// ===============================
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch featured properties" });
  }
};
