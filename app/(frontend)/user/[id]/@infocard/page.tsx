import Avatar from "@components/Avatar";
import formatCurrency from "@lib/formatCurrency";
import prisma from "@lib/prisma";
import {
  mdiAccountCog,
  mdiBottleSoda,
  mdiCashFast,
  mdiCashPlus,
  mdiHelp,
  mdiLogout,
} from "@mdi/js";
import Icon from "@mdi/react";
import { TransactionType } from "@prisma/client";
import Link from "next/link";
import { ReactNode } from "react";

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

type Transaction = {
  createdAt: Date;
  creditDelta: number;
  transactionType: TransactionType;
  product: {
    name: string;
  } | null;
};

function timeAgo(date: Date) {
  var seconds = Math.floor((Date.now() - Number(date)) / 1000);
  const year = seconds / 31536000;
  const month = seconds / 2592000;
  const day = seconds / 86400;
  const hour = seconds / 3600;
  const minute = seconds / 60;
  if (year > 2) {
    return Math.floor(year) + " years ago";
  }
  if (year > 1) {
    return Math.floor(year) + " year ago";
  }
  if (month > 2) {
    return Math.floor(month) + " months ago";
  }
  if (day > 2) {
    return Math.floor(day) + " days ago";
  }
  if (day > 1) {
    return Math.floor(day) + " day ago";
  }
  if (hour > 2) {
    return Math.floor(hour) + " hours ago";
  }
  if (minute > 2) {
    return Math.floor(minute) + " minutes ago";
  }
  if (seconds > 30) {
    return "About a minute ago";
  }
  return "Just now";
}

function ListTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length == 0) {
    return (
      <p className="mb-2 px-4 text-gray-500 dark:text-gray-300">
        There are no new transactions.
      </p>
    );
  }
  const icon = (t: Transaction) => {
    if (t.transactionType === TransactionType.AccountCharged)
      return mdiCashPlus;
    if (t.transactionType === TransactionType.ProductBought)
      return mdiBottleSoda;
    if (t.transactionType === TransactionType.AccountTransfer)
      return mdiCashFast;
    return mdiHelp;
  };
  const description = (t: Transaction) => {
    if (t.transactionType === TransactionType.AccountCharged) return "Charged";
    if (t.transactionType === TransactionType.ProductBought)
      return t?.product?.name ?? "Bought";
    if (t.transactionType === TransactionType.AccountTransfer)
      return "Transfered";
    return "Unknown";
  };
  return (
    <div className="mb-2">
      <h6 className="px-6">Recent Transactions</h6>
      {transactions.map((t) => (
        <div
          className="w-full px-8 text-gray-500 dark:text-gray-300 flex"
          key={t.createdAt.toString()}
        >
          <Icon path={icon(t)} size={1} />
          <span className="w-12 px-1">{formatCurrency(t.creditDelta)}</span>
          <span className="flex-grow px-6">{description(t)}</span>
          <span
            className="cursor-help underline decoration-dotted"
            title={t.createdAt.toLocaleString()}
          >
            {timeAgo(t.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function InfoCard({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUniqueOrThrow({
    select: {
      id: true,
      name: true,
      updatedAt: true,
      avatar: true,
      credit: true,
      transactions: {
        select: {
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
  return (
    <div>
      <div className="w-full max-xl:flex pattern-1 flex xl:rounded-t-3xl xl:border-b border-b-black xl:bg-primary-800 xl:p-2 xl:drop-shadow-md sm:max-2xl:pl-20">
        <div>
          <Avatar image={user.avatar} alt={user.name} />
        </div>
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
      <div className="rounded-b-3xl bg-white drop-shadow-md dark:bg-primary-500 z-50 max-xl:max-w-96 xl:block max-xl:float-left max-xl:absolute sm:max-xl:ml-6 max-sm:ml-2 hidden">
        <h3 className="px-4 pt-4 text-xl">Welcome {user.name}!</h3>
        <ListTransactions transactions={user.transactions} />
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
    </div>
  );
}
