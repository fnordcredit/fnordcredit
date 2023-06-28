import prisma from "@lib/prisma";
import Image from "next/image";
import AddProductDialog from "./AddProductDialog";
import { addProductAction } from "@actions/admin/products";
import VisibilityToggle from "./VisibilityToggle";

export default async function ProductPage() {
  const cats = await prisma.productCategory.findMany({
    include: {
      products: {
        orderBy: {
          id: "asc",
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
  return cats.map((c) => (
    <div key={c.id} className="m-8 w-96">
      <div className="flex">
        <h3 className="flex-grow text-xl font-bold">{c.name}</h3>
        <AddProductDialog categoryId={c.id} action={addProductAction} />
      </div>
      <div className="table w-full">
        <div className="card table-row font-bold">
          {["Image", "Name", "Price", "EAN", "Visible"].map((s) => (
            <div
              key={s}
              className="table-cell border-b-2 border-black px-3 py-1 text-center dark:border-white"
            >
              {s}
            </div>
          ))}
        </div>
        {c.products.map((p) => (
          <div className="card table-row" key={p.id}>
            <div className="table-cell p-1">
              {p.image != null ? (
                <Image
                  src={p.image}
                  width={32}
                  height={32}
                  alt="Product Image"
                  className="mx-auto"
                />
              ) : (
                "No Image"
              )}
            </div>
            <div className="table-cell border-l border-black px-3 py-1 align-middle dark:border-white">
              {p.name}
            </div>
            <div className="table-cell border-l border-black px-3 py-1 align-middle dark:border-white">
              {p.price}
            </div>
            <div className="table-cell border-l border-black px-3 py-1 align-middle dark:border-white">
              {p.ean}
            </div>
            <div className="table-cell border-l border-black px-3 py-1 align-middle dark:border-white">
              <VisibilityToggle productId={p.id} hidden={p.hidden} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ));
}
