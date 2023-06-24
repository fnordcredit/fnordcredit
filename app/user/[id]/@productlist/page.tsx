import { revalidatePath } from "next/cache";
import prisma from "@lib/prisma";
import { TransactionType } from "@prisma/client";
import HideChargeMoneyForm from "../ChargeMoneyForm";
import Image from "next/image";

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

export default async function ProductView({
  params,
}: {
  params: { id: string };
}) {
  const productCategories = await prisma.productCategory.findMany({
    select: {
      name: true,
      id: true,
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      },
    },
  });
  return (
    <div className="mx-auto w-full">
      <h2 className="m-2 pb-2 text-xl font-bold">Charge Money</h2>
      <HideChargeMoneyForm
        action={updateCash}
        userId={parseInt(params.id, 10)}
      />
      {productCategories.map((cat) => (
        <div key={cat.id}>
          <h2 className="m-2 text-xl font-bold">{cat.name}</h2>
          <div className="flex">
            {cat.products.map((product) => (
              <div
                className="m-2 flex w-48 rounded-xl bg-gray-100 drop-shadow-lg dark:bg-primary-500"
                key={product.id}
              >
                {product.image != null ? (
                  <Image
                    width={96}
                    height={96}
                    src={product.image}
                    alt={product.name}
                    className="rounded-l-xl"
                  />
                ) : null}
                <div className="mt-4 w-full flex-wrap p-1 text-center">
                  <span>{product.name}</span>
                  <br />
                  <span>{(product.price / 100).toFixed(2).toString()}€</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
