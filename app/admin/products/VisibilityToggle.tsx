"use client";
import { changeProductVisibility } from "@actions/admin/products";
import { useTransition } from "react";

type Props = {
  hidden: boolean;
  productId: number;
};

export default function VisibilityToggle({ hidden, productId }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <input
      type="checkbox"
      disabled={isPending}
      checked={!hidden}
      onClick={() =>
        startTransition(() => changeProductVisibility(productId, !hidden))
      }
    />
  );
}
