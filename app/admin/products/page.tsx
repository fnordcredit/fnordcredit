import prisma from "@lib/prisma";
import Image from "next/image";

export default async function ProductPage() {
  const cats = await prisma.productCategory.findMany({
    include: {
      products: true,
    },
  });
  return cats.map((c) => (
    <div key={c.id}>
      <h3 className="text-xl font-bold">{c.name}</h3>
      <div>
        <div className="card table-row font-bold">
          <div className="table-cell border-b-2 border-black px-3 py-1 text-center dark:border-white">
            Image
          </div>
          <div className="table-cell border-b-2 border-black px-3 py-1 text-center dark:border-white">
            Name
          </div>
          <div className="table-cell border-b-2 border-black px-3 py-1 text-center dark:border-white">
            Price
          </div>
          <div className="table-cell border-b-2 border-black px-3 py-1 text-center dark:border-white">
            EAN
          </div>
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
          </div>
        ))}
      </div>
    </div>
  ));
}
