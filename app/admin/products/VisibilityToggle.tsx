"use client";
import { changeProductVisibility } from "@actions/admin/products";
import { mdiEye, mdiEyeOff } from "@mdi/js";
import Icon from "@mdi/react";
import { useTransition } from "react";

type Props = {
  hidden: boolean;
  productId: number;
};

export default function VisibilityToggle({ hidden, productId }: Props) {
  const [isPending, startTransition] = useTransition();
  const visible = !hidden;
  return (
    <a
      onClick={() =>
        startTransition(() => changeProductVisibility(productId, !hidden))
      }
      className={`cursor-pointer${visible ? "" : " text-gray-500"}${
        isPending ? " animate-pulse" : ""
      }`}
    >
      <Icon size={1} path={visible ? mdiEye : mdiEyeOff} />
    </a>
  );
}
