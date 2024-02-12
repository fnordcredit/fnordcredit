import { revalidateTag, unstable_cache } from "next/cache";
import prisma from "@lib/prisma";

const getUsersPrisma = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      updatedAt: true,
      avatar: true,
      credit: true,
    },
  });
  return users;
};

const getCachedUsers = unstable_cache(getUsersPrisma, ["users"], {
  tags: ["users"],
});

export default function getUsers() {
  return getCachedUsers();
}

export function revalidateUsers() {
  revalidateTag("users");
}
