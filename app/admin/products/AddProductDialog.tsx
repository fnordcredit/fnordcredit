"use client";
import Form, { Submit, TextBox } from "@components/Form";
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
        <Form
          action={async (fd) => {
            await action(fd);
            setOpen(false);
          }}
        >
          <input type="hidden" name="categoryId" value={categoryId} />
          <TextBox
            name="name"
            placeholder="Product Name"
            required
            label="Product Name"
          />
          <TextBox
            name="price"
            placeholder="Price in cents"
            required
            label="Price"
            showErrorOnFocus
            regexErrorMessage="Price has to be a number"
            pattern="[0-9]+"
          />
          <input
            type="file"
            name="image"
            accept="image/png, image/jpeg, image/gif"
          />
          <Submit>Add Product</Submit>
        </Form>
      </SimpleDialog>
    </>
  );
}
