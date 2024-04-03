import prisma from "@lib/prisma";
import InfoCard from "./InfoCard";

async function toggleMenu(f: boolean) {
  "use server";
  return !f;
}

export default async function InfoCardServer({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUniqueOrThrow({
    select: {
      id: true,
      name: true,
      updatedAt: true,
      avatar: true,
      credit: true,
      transactions: {
        select: {
          id: true,
          product: {
            select: {
              name: true,
            },
          },
          transactionType: true,
          transferUser: true,
          createdAt: true,
          creditDelta: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
    where: {
      id: parseInt(params.id, 10),
    },
  });
  return <InfoCard user={user} action={toggleMenu} />;
}
