import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { name: "Alice" },
    update: {},
    create: {
      name: "Alice",
    },
  });
  const bob = await prisma.user.upsert({
    where: { name: "Bob" },
    update: {},
    create: {
      name: "Bob",
    },
  });
  console.log({ alice, bob });
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
