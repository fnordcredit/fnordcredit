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
  await prisma.productCategory.upsert({
    where: { id: 0 },
    update: {},
    create: {
      id: 0,
      name: "Drinks",
      order: 0,
    },
  });
  await prisma.productCategory.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Food",
      order: 1,
    },
  });
  // for (let i in [0, 1, 2]) {
  //   await prisma.product.upsert({
  //     where: { id: Number(i) },
  //     update: {},
  //     create: {
  //       id: Number(i),
  //       name: `Test Drink ${i.toString()}`,
  //       price: 100,
  //       categoryId: drinks.id,
  //       order: Number(i),
  //       hidden: false,
  //       image: "/images/products/test.png",
  //     },
  //   });
  //   await prisma.product.upsert({
  //     where: { id: Number(i) + 100 },
  //     update: {},
  //     create: {
  //       id: Number(i) + 100,
  //       name: `Test Food ${i.toString()}`,
  //       price: 150,
  //       categoryId: food.id,
  //       order: Number(i),
  //       hidden: false,
  //       image: i == 2 ? null : "/images/products/test.png",
  //     },
  //   });
  // }
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
