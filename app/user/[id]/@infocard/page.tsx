import Avatar from "@components/Avatar";
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
};

function ListTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length == 0) {
    return (
      <p className="mb-2 px-4 text-gray-500 dark:text-gray-300">
        There are no new transactions.
      </p>
    );
  }
  const icon = (t: TransactionType) => {
    if (t === TransactionType.AccountCharged) return mdiCashPlus;
    if (t === TransactionType.ProductBought) return mdiBottleSoda;
    if (t === TransactionType.AccountTransfer) return mdiCashFast;
    return mdiHelp;
  };
  const description = (t: TransactionType) => {
    if (t === TransactionType.AccountCharged) return "Account Charged";
    if (t === TransactionType.ProductBought) return "Product Bought";
    if (t === TransactionType.AccountTransfer) return "Transfer";
    return "Unknown";
  };
  return (
    <div className="mb-2">
      <h6 className="px-6">Recent Transactions</h6>
      {transactions.map(({ createdAt, creditDelta, transactionType }) => (
        <div
          className="flex w-full px-8 text-gray-500 dark:text-gray-300"
          key={createdAt.toString()}
        >
          <Icon path={icon(transactionType)} size={1} />
          <span className="w-12 px-1">
            {(creditDelta / 100).toFixed(2).toString()}€
          </span>
          <span className="flex-grow px-6 text-center">
            {description(transactionType)}
          </span>
          <span className="cursor-help underline decoration-dotted">
            {/*createdAt.toLocaleString()*/}1 Day Ago
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
          productId: true,
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
    <>
      <div className="pattern-1 flex rounded-t-3xl border-b border-b-black bg-primary-800 p-2 drop-shadow-md">
        <Avatar image={user.avatar} alt={user.name} />
        <h2 className="mx-6 my-auto flex-grow text-2xl font-bold text-white">
          {user.name}
        </h2>
        <span
          className={`mx-6 my-auto p-2 font-bold ${
            user.credit < 0 ? "bg-red-600" : "bg-green-600"
          } rounded-lg text-primary-50`}
        >
          {(user.credit / 100).toFixed(2).toString()}€
        </span>
      </div>
      <div className="rounded-b-3xl bg-white drop-shadow-md dark:bg-primary-500">
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
    </>
  );
}
