"use client";
import SimpleDialog from "@components/SimpleDialog";
import { mdiPlusCircle } from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";

type Props = {
  action: (_f: FormData) => Promise<void>;
  categoryId: number;
};

export default function AddProductDialog({ action, categoryId }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a onClick={() => setOpen(true)} className="cursor-pointer">
        <Icon path={mdiPlusCircle} size={1} />
      </a>
      <SimpleDialog
        title="Add Product"
        open={open}
        onClose={() => setOpen(false)}
      >
        <form action={action}>
          <input type="hidden" name="categoryId" value={categoryId} />
          <input type="text" name="name" placeholder="Product Name" />
          <input type="text" name="price" placeholder="Price in cents" />
          <button type="submit">Add Product</button>
        </form>
      </SimpleDialog>
    </>
  );
}
