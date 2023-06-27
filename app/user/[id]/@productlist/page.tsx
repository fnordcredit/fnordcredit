import { revalidatePath } from "next/cache";
import prisma from "@lib/prisma";
import { TransactionType } from "@prisma/client";
import HideChargeMoneyForm from "../ChargeMoneyForm";

async function updateCash(formData: FormData) {
  "use server";
  if (formData.get("id") == null) return;
  const id = parseInt(formData.get("id")?.toString() ?? "", 10);

  await prisma.transaction.create({
    data: {
      userId: id,
      creditDelta: parseInt(formData.get("amount")?.toString() ?? "0", 10),
      transactionType: TransactionType.AccountCharged,
    },
  });
  revalidatePath("/user/[id]");
}

export default async function UserView({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto w-full rounded-3xl bg-white p-4 drop-shadow-lg dark:bg-primary-600">
      <h2 className="m-2 pb-2 text-xl">Charge Money</h2>
      <HideChargeMoneyForm
        action={updateCash}
        userId={parseInt(params.id, 10)}
      />
    </div>
  );
}
