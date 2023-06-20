import prisma from "@lib/prisma";
import Link from "next/link";
import Avatar from "@components/Avatar";
import AppBar from "@components/AppBar";
import NewAccountDialog from "./newaccount";
import { redirect } from "next/navigation";

async function createAccount(data: FormData) {
  "use server";
  const userName = data.get("name")?.toString();
  if (userName == null) return;
  const user = await prisma.user.create({
    data: {
      name: userName,
    },
    select: {
      id: true,
    },
  });
  redirect(`/user/${user.id}`);
}

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
  return (
    <>
      <AppBar>
        <div className="flex-grow" />
        <NewAccountDialog action={createAccount} />
      </AppBar>
      <div className="mx-auto my-2 flex flex-wrap content-around">
        {users.map((x) => (
          <Link
            href={`/user/${x.id.toString()}`}
            className="m-6 flex h-28 w-56 cursor-pointer rounded-md bg-slate-50 px-2 py-2 drop-shadow-lg transition-colors duration-200 hover:bg-primary-100 dark:bg-primary-700 dark:text-slate-200 dark:hover:bg-primary-500"
            key={x.id}
          >
            <Avatar image={x.avatar} alt={x.name} />
            <span className="mx-3 my-auto block w-24 text-right font-bold text-primary-500 dark:text-slate-200">
              {x.name}
              <br />
              <span className="text-sm font-normal">
                {(x.credit / 100).toFixed(2).toString() + "€"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
