import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const areas = [
  "Louvor",
  "Midia",
  "Recepcao",
  "Kids",
  "Estacionamento",
  "Intercessao",
  "Diaconia",
  "Som",
  "Transmissao",
  "Limpeza",
];

async function main() {
  // Create default areas
  for (const name of areas) {
    await prisma.area.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "julia ibrasil",
    10
  );
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "julia@ibrasil.com" },
    update: {
      password: hashedPassword,
      name: "Julia",
    },
    create: {
      email: process.env.ADMIN_EMAIL || "julia@ibrasil.com",
      password: hashedPassword,
      name: "Julia",
    },
  });

  console.log("Seed concluido!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
