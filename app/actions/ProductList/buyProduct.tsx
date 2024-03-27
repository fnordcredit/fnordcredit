"use server";
import prisma from "@lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";
import { revalidateUsers } from "@cache/users";
import { nanoid } from "nanoid";
import formatCurrency from "@lib/formatCurrency";

interface FormState {
  id: string;
  error: boolean;
  message: string;
}

export async function buyProduct(
  _state: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const err = (msg: string) => ({ id: nanoid(), error: true, message: msg });
  if (formData.get("id") == null) return err("Format error");
  const id = parseInt(formData.get("id")?.toString() ?? "", 10);
  const user = await prisma.user.findUnique({ where: { id } });
  if (user == null) return err("Unknown user");
  const creditDelta = parseInt(formData.get("amount")?.toString() ?? "0", 10);
  if (
    user.credit + creditDelta < 0 &&
    Math.abs(user.credit + creditDelta) > Math.abs(user?.debtLimit)
  ) {
    return err("Not enough credit available");
  }
  const product = await prisma.product.findUnique({
    where: {
      id: parseInt(formData.get("product")?.toString() ?? "0", 10),
    },
  });
  if (product == null) return err("Unknown product");
  await prisma.transaction.create({
    data: {
      userId: id,
      creditDelta,
      transactionType: TransactionType.ProductBought,
      productId: product.id,
    },
  });
  revalidateUsers();
  revalidatePath(`/user/${id}`, "layout");
  return {
    id: nanoid(),
    error: false,
    message: `Successfully bought ${product.name ?? "unknown product"} for ${formatCurrency(product.price)}`,
  };
}
