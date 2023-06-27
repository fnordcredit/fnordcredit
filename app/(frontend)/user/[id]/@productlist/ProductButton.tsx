"use client";
import { Product } from "@prisma/client";
import Image from "next/image";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

function SubmitButton({ product }: { product: Partial<Product> }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`card m-2 flex h-24 w-48 rounded-xl hover:brightness-125 ${
        pending ? "grayscale" : "grayscale-0"
      }`}
      disabled={pending}
    >
      {product.image != null ? (
        <Image
          width={96}
          height={96}
          src={product.image}
          alt={product.name ?? "Unknown Product"}
          className="rounded-l-xl"
        />
      ) : null}
      <div className="mt-4 w-full flex-wrap p-1 text-center">
        <span>{product.name ?? "Unknown Product"}</span>
        <br />
        <span>{((product.price ?? 0) / 100).toFixed(2).toString()}€</span>
      </div>
    </button>
  );
}

export default function ProductButton({
  product,
  action,
  userId,
}: {
  product: Partial<Product>;
  action: (_f: FormData) => Promise<void>;
  userId: number;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={userId} />
      <input type="hidden" name="product" value={product.id ?? 0} />
      <input type="hidden" name="amount" value={-(product.price ?? 0)} />
      <SubmitButton product={product} />
    </form>
  );
}
