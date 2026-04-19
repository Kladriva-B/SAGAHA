import { PrismaClient, Role } from "@prisma/client";

const managerEmail = process.env.MANAGER_SEED_EMAIL ?? "manager@sagaha.cm";
const managerPassword = process.env.MANAGER_SEED_PASSWORD ?? "SagahaManager2026!";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@sagaha.cm";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "SagahaAdmin2026!";
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password: hash,
      role: Role.ADMIN,
    },
    update: {
      password: hash,
      role: Role.ADMIN,
    },
  });

  const managerHash = await bcrypt.hash(managerPassword, 12);
  await prisma.user.upsert({
    where: { email: managerEmail },
    create: {
      email: managerEmail,
      password: managerHash,
      role: Role.MANAGER,
    },
    update: {
      password: managerHash,
      role: Role.MANAGER,
    },
  });

  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: "Thé noir SAGAHA Premium",
          description: "Blend équilibré, notes maltées et fleurs séchées — sélection Cameroun.",
          price: 4500,
          stock: 500,
          minStockAlert: 40,
          category: "Thé noir",
          isActive: true,
        },
        {
          name: "Thé vert jasmin",
          description: "Thé vert parfumé au jasmin, idéal pour la restauration.",
          price: 5200,
          stock: 320,
          minStockAlert: 30,
          category: "Thé vert",
          isActive: true,
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
