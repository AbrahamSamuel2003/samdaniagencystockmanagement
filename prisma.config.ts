import "dotenv/config";

// Prisma 6 / 7 configuration definition
const config = {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    directUrl: process.env.DIRECT_URL ?? "",
  },
};

export default config;
