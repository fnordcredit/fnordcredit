"use client";
import { buyProduct } from "@actions/ProductList/buyProduct";
import Snackbar, { SnackbarContainer } from "@components/Snackbar";
import formatCurrency from "@lib/formatCurrency";
import { Product } from "@prisma/client";
import Image from "next/image";
import { useFormState, useFormStatus } from "react-dom";

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
        <span>{formatCurrency(product.price ?? 0)}</span>
      </div>
    </button>
  );
}

export default function ProductButton({
  product,
  userId,
}: {
  product: Partial<Product>;
  userId: number;
}) {
  const [formReturn, formAction] = useFormState(buyProduct, null);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={userId} />
      <input type="hidden" name="product" value={product.id ?? 0} />
      <input type="hidden" name="amount" value={-(product.price ?? 0)} />
      <SubmitButton product={product} />
      <SnackbarContainer>
        {formReturn?.message != null ? (
          <Snackbar
            key={formReturn?.id}
            theme={formReturn.error ? "error" : "success"}
          >
            {formReturn?.message}
          </Snackbar>
        ) : null}
      </SnackbarContainer>
      {formReturn?.error === false ? (
        <audio key={formReturn?.id} autoPlay={true} src="/ka-ching.mp3" />
      ) : null}
    </form>
  );
}
