import getUsers from "@cache/users";
import UserList from "./UserList";

export default async function Index() {
  const users = await getUsers();
  return <UserList users={users} />;
}
