import formatCurrency from "@lib/formatCurrency";
import { mdiBottleSoda, mdiCashFast, mdiCashPlus, mdiHelp } from "@mdi/js";
import Icon from "@mdi/react";
import { TransactionType } from "@prisma/client";

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

export default function TransactionsList({
  transactions,
}: {
  transactions: Transaction[];
}) {
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
