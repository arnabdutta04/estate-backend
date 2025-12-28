const prisma = require("../prismaClient");

/**
 * GET /api/brokers
 * Public – with filters
 */
exports.getBrokers = async (req, res) => {
  try {
    const { city, specialization, minRating } = req.query;

    const where = {
      verified: true,
      rating: minRating ? { gte: Number(minRating) } : undefined,
      specialization: specialization
        ? { has: specialization.toUpperCase() }
        : undefined,
      servingAreas: city
        ? { hasSome: [city] }
        : undefined,
    };

    const brokers = await prisma.broker.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        rating: "desc",
      },
    });

    res.json(brokers);
  } catch (error) {
    console.error("getBrokers error:", error);
    res.status(500).json({ message: "Failed to fetch brokers" });
  }
};

/**
 * GET /api/brokers/:id
 * Public
 */
exports.getBrokerById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const broker = await prisma.broker.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        properties: true,
      },
    });

    if (!broker) {
      return res.status(404).json({ message: "Broker not found" });
    }

    res.json(broker);
  } catch (error) {
    console.error("getBrokerById error:", error);
    res.status(500).json({ message: "Failed to fetch broker" });
  }
};

/**
 * POST /api/brokers
 * Private (JWT required)
 */
exports.createBroker = async (req, res) => {
  try {
    const {
      company,
      licenseNumber,
      experience,
      specialization,
      servingAreas,
    } = req.body;

    const userId = req.user.id;

    const existingBroker = await prisma.broker.findUnique({
      where: { userId },
    });

    if (existingBroker) {
      return res
        .status(400)
        .json({ message: "Broker profile already exists" });
    }

    const broker = await prisma.broker.create({
      data: {
        userId,
        company,
        licenseNumber,
        experience,
        specialization: Array.isArray(specialization)
          ? specialization.map((s) => s.toUpperCase())
          : [specialization.toUpperCase()],
        servingAreas: servingAreas || [],
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { role: "BROKER" },
    });

    res.status(201).json(broker);
  } catch (error) {
    console.error("createBroker error:", error);
    res.status(500).json({ message: "Failed to create broker" });
  }
};
