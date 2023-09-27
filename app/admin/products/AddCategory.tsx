"use client";
import { addCategory } from "@actions/admin/products";
import Form, { Submit, TextBox } from "@components/Form";
import SimpleDialog from "@components/SimpleDialog";
import { useState } from "react";

export default function AddCategory() {
  const [open, setOpen] = useState(false);
  return (
    <a onClick={() => setOpen(true)} className="my-auto cursor-pointer">
      Add Category
      <SimpleDialog
        onClose={() => setOpen(false)}
        open={open}
        title="Create a category"
      >
        <Form
          action={async (fd) => {
            await addCategory(fd);
            setOpen(false);
          }}
        >
          <TextBox
            required
            name="name"
            label="Category Name"
            placeholder="Category Name..."
          />
          <Submit>Create Category</Submit>
        </Form>
      </SimpleDialog>
    </a>
  );
}
