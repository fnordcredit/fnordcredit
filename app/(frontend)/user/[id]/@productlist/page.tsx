import prisma from "@lib/prisma";
import HideChargeMoneyForm from "../ChargeMoneyForm";
import ProductButton from "./ProductButton";
import { updateCash } from "@actions/ProductList/updateCash";
import { buyProduct } from "@actions/ProductList/buyProduct";

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
        where: {
          hidden: false,
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
              <ProductButton
                product={product}
                action={buyProduct}
                userId={parseInt(params.id, 10)}
                key={product.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
