import prisma from "@lib/prisma";
import Image from "next/image";
import AddProductDialog from "./AddProductDialog";
import { revalidatePath } from "next/cache";

async function addProductAction(data: FormData) {
  "use server";
  const getImage = async () => {
    const file = data.get("image") as File | null;
    if (file == null) return null;
    const buffer = await (data.get("image") as File).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let out = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      out += String.fromCharCode(bytes[i]);
    }
    return out.length == 0 ? null : `data:${file.type};base64,${btoa(out)}`;
  };
  const image = await getImage();
  await prisma.product.create({
    data: {
      name: data.get("name")?.toString() ?? "Unknown",
      price: parseInt(data.get("price")?.toString() ?? "0", 10),
      categoryId: parseInt(data.get("categoryId")?.toString() ?? "0", 10),
      order: 0,
      hidden: false,
      image: image,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/user/[id]");
}

export default async function ProductPage() {
  const cats = await prisma.productCategory.findMany({
    include: {
      products: true,
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
              <input type="checkbox" disabled={true} checked={!p.hidden} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ));
}
