"use client";
import Avatar from "@components/Avatar";
import formatCurrency from "@lib/formatCurrency";
import {
  mdiAccountCog,
  mdiCashFast,
  mdiLogout,
  mdiTriangleDown,
} from "@mdi/js";
import TransactionsList from "./TransactionsList";
import { Transaction, User } from "@prisma/client";
import Icon from "@mdi/react";
import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { useFormState } from "react-dom";
import { useClickAway } from "@uidotdev/usehooks";

function MenuItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex w-full border-t p-3.5 last:rounded-b-3xl last:pb-4 hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-primary-400"
    >
      <Icon path={icon} size={1} />
      <span className="mx-4">{children}</span>
    </Link>
  );
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface InfoCardProps {
  user: Omit<Omit<Omit<User, "createdAt">, "debtLimit">, "email"> & {
    transactions: (Omit<
      Omit<Omit<Transaction, "userId">, "transferUserId">,
      "productId"
    > & { product: { name: string } | null })[];
  };
  action: (_f: boolean) => boolean | Promise<boolean>;
}

export default function InfoCard({ user, action }: InfoCardProps) {
  const [state, formAction] = useFormState(action, false);
  const [clientState, setClientState] = useState(false);
  // Bypass the form action request when js is enabled
  const clientHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientState(!clientState);
  };
  const ref = useClickAway<HTMLFormElement>(() => {
    setClientState(false);
  });
  return (
    <form action={formAction} onSubmit={clientHandler} ref={ref}>
      <input type="hidden" value={String(state)} name="opened" />
      <div className="w-full max-xl:flex pattern-1 flex xl:rounded-t-3xl xl:border-b border-b-black bg-primary-800 xl:p-2 xl:drop-shadow-md sm:max-2xl:pl-20">
        <button type="submit" className="z-10 xl:pointer-events-none">
          <Icon
            size={0.5}
            path={mdiTriangleDown}
            className="float-end mt-12 ml-1 inline xl:hidden"
            vertical={state || clientState}
          />
          <Avatar image={user.avatar} alt={user.name} />
        </button>
        <h2 className="mx-6 my-auto flex-grow text-2xl font-bold text-white">
          {user.name}
        </h2>
        <span
          className={`mx-6 my-auto p-2 font-bold ${
            user.credit < 0 ? "bg-red-600" : "bg-green-600"
          } rounded-lg text-primary-50`}
        >
          {formatCurrency(user.credit)}
        </span>
      </div>
      <div
        className={
          "rounded-b-3xl bg-white drop-shadow-md dark:bg-primary-500 z-50 max-xl:max-w-96 xl:block xl:visible xl:opacity-100 max-xl:float-left max-xl:absolute sm:max-xl:ml-6 max-sm:ml-2 transition-all duration-500 ease-in" +
          (state || clientState ? "" : " opacity-0 invisible")
        }
      >
        <h3 className="px-4 pt-4 text-xl">Welcome {user.name}!</h3>
        <TransactionsList transactions={user.transactions} />
        <div className="w-full">
          <MenuItem href={`/user/${user.id}/transfer`} icon={mdiCashFast}>
            Transfer Credit
          </MenuItem>
          <MenuItem href={`/user/${user.id}/settings`} icon={mdiAccountCog}>
            Account Settings
          </MenuItem>
          <MenuItem href="/" icon={mdiLogout}>
            Logout
          </MenuItem>
        </div>
      </div>
    </form>
  );
}
