"use server";
import prisma from "@lib/prisma";
import { revalidatePath } from "next/cache";

export async function addProductAction(data: FormData) {
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
  revalidatePath("/admin/products", "page");
  revalidatePath("/user/[id]", "page");
}

export async function changeProductVisibility(
  productId: number,
  hidden: boolean,
) {
  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      hidden: hidden,
    },
  });
  revalidatePath("/admin/products", "page");
  revalidatePath("/user/[id]", "page");
}
