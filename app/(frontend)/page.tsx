import prisma from "@lib/prisma";
import UserList from "./UserList";

export default async function Index() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      updatedAt: true,
      avatar: true,
      credit: true,
    },
  });
  return <UserList users={users} />;
}
