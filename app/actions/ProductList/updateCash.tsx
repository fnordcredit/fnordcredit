"use server";
import prisma from "@lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";

export async function updateCash(formData: FormData) {
  if (formData.get("id") == null) return;
  const id = parseInt(formData.get("id")?.toString() ?? "", 10);

  await prisma.transaction.create({
    data: {
      userId: id,
      creditDelta: parseInt(formData.get("amount")?.toString() ?? "0", 10),
      transactionType: TransactionType.AccountCharged,
    },
  });
  revalidatePath(`/user/${id}`, "layout");
  revalidatePath("/", "page");
}
