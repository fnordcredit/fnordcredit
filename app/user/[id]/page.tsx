import prisma from '@lib/prisma';
import { revalidatePath } from 'next/cache';
import ChargeMoneyForm from './ChargeMoneyForm';
import Avatar from '../../components/Avatar';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiAccountCog, mdiCashFast, mdiLogout } from '@mdi/js';
import { TransactionType } from '@prisma/client';
import { ReactNode } from 'react';

async function updateCash(formData: FormData) {
  'use server';
  if (formData.get("id") == null) return;
  const id = parseInt(formData.get("id")?.toString() ?? "", 10);

  await prisma.transaction.create({
    data: {
      userId: id,
      creditDelta: parseInt(formData.get("amount")?.toString() ?? "0", 10),
      transactionType: TransactionType.AccountCharged
    }
  });
  revalidatePath("/user/[id]");
}

function MenuItem({ href, icon, children }: { href: string, icon: string, children: ReactNode }) {
  return (
    <Link href={href} className="flex w-full border-t dark:border-slate-600 p-3.5 last:pb-4 hover:bg-gray-100 dark:hover:bg-primary-400 last:rounded-b-3xl">
      <Icon path={icon} size={1} />
      <span className="mx-4">{children}</span>
    </Link>
  );
};

function ListTransactions({ transactions }: { transactions: { createdAt: Date, creditDelta: number }[] }) {
  if (transactions.length == 0) {
    return (
      <p className="text-gray-500 dark:text-gray-300 px-4 mb-2">There are no new transactions.</p>
    );
  }
  return (
    <div className="mb-2">
      <h6 className="px-6">Recent Transactions</h6>
      {transactions.map(({ createdAt, creditDelta }) => (
        <p className="text-gray-500 dark:text-gray-300 px-8" key={createdAt.toString()}>{ (creditDelta / 100).toFixed(2).toString() }€ at { createdAt.toLocaleString() }</p>
      ))}
    </div>
  );
}

export default async function UserView({ params }: { params: { id: string } }) {
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
          creditDelta: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      },
    },
    where: {
      id: parseInt(params.id, 10)
    },
  });
  return (
    <div className="flex">
      <div className="w-1/4 mt-4 p-4">
        <div className="pattern-1 bg-primary-800 p-2 rounded-t-3xl flex border-b border-b-black drop-shadow-md">
          <Avatar image={user.avatar} alt={user.name} /> 
          <h2 className="text-2xl font-bold my-auto mx-6 text-white flex-grow">{ user.name }</h2>
          <span className={`mx-6 p-2 my-auto font-bold ${user.credit < 0 ? "bg-red-600" : "bg-green-600"} text-primary-50 rounded-lg`}>
            { (user.credit / 100).toFixed(2).toString() }€
          </span>
        </div>
        <div className="bg-white dark:bg-primary-500 rounded-b-3xl drop-shadow-md">
          <h3 className="text-xl px-4 pt-4">Welcome {user.name}!</h3>
          <ListTransactions transactions={user.transactions} />
          <div className="w-full">
            <MenuItem href={`/user/${user.id}/transfer`} icon={mdiCashFast}>Transfer Credit</MenuItem>
            <MenuItem href={`/user/${user.id}/settings`} icon={mdiAccountCog}>Account Settings</MenuItem>
            <MenuItem href="/" icon={mdiLogout}>Logout</MenuItem>
          </div>
        </div>
      </div>
      <div className="mt-8 mb-4 mx-auto p-4 rounded-3xl bg-white dark:bg-primary-600 w-8/12 drop-shadow-lg">
        <h2 className="text-xl m-2 pb-2">Charge Money</h2>
        <ChargeMoneyForm action={updateCash} userId={user.id} />
      </div>
    </div>
  );
};
