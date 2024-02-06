"use client";
import { ProductCategory, Product } from "@prisma/client";
import AddProductDialog from "./AddProductDialog";
import { addProductAction, deleteCategory } from "@actions/admin/products";
import Image from "next/image";
import formatCurrency from "@lib/formatCurrency";
import VisibilityToggle from "./VisibilityToggle";
import { ReactNode, useMemo, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiPlusCircle,
  mdiSortAlphabeticalAscending,
  mdiSortAlphabeticalDescending,
  mdiSortAscending,
  mdiSortBoolAscending,
  mdiSortBoolDescending,
  mdiSortDescending,
  mdiSortNumericAscending,
  mdiSortNumericDescending,
} from "@mdi/js";
import Button from "@components/Form/Button";
import SimpleDialog from "@components/SimpleDialog";

interface CategoryBoxProps {
  category: ProductCategory & { products: Product[] };
}

interface Column {
  name: ReactNode;
  sort: (_a: Product, _b: Product) => number;
  render: (_p: Product) => ReactNode;
  iconAsc: string;
  iconDesc: string;
}

const tableColumns: Column[] = [
  {
    name: (
      <>
        {"#"}
        <sub>Id</sub>
      </>
    ),
    sort: (a, b) => a.id - b.id,
    render: (p) => p.id,
    iconAsc: mdiSortNumericAscending,
    iconDesc: mdiSortNumericDescending,
  },
  {
    name: "Image",
    sort: (a, b) => (a.image == b.image ? 0 : a.image == null ? -1 : 1),
    render: (p) =>
      p.image != null ? (
        <Image
          src={p.image}
          width={32}
          height={32}
          alt="Product Image"
          className="mx-auto"
        />
      ) : (
        "No Image"
      ),
    iconAsc: mdiSortAscending,
    iconDesc: mdiSortDescending,
  },
  {
    name: "Name",
    sort: (a, b) => a.name.localeCompare(b.name),
    render: (p) => p.name,
    iconAsc: mdiSortAlphabeticalAscending,
    iconDesc: mdiSortAlphabeticalDescending,
  },
  {
    name: "Price",
    sort: (a, b) => a.price - b.price,
    render: (p) => formatCurrency(p.price),
    iconAsc: mdiSortNumericAscending,
    iconDesc: mdiSortNumericDescending,
  },
  {
    name: "EAN",
    sort: (a, b) => a.ean.localeCompare(b.ean),
    render: (p) => p.ean,
    iconAsc: mdiSortNumericAscending,
    iconDesc: mdiSortNumericDescending,
  },
  {
    name: "Visible",
    sort: (a, b) => (a.hidden == b.hidden ? 0 : a.hidden ? -1 : 1),
    render: (p) => <VisibilityToggle productId={p.id} hidden={p.hidden} />,
    iconAsc: mdiSortBoolAscending,
    iconDesc: mdiSortBoolDescending,
  },
  {
    name: "Actions",
    sort: (_a, _b) => 0,
    render: (p) => <ProductActions product={p} />,
    iconAsc: "",
    iconDesc: "",
  },
];

export default function CategoryBox({ category: c }: CategoryBoxProps) {
  return (
    <div
      key={c.id}
      className="m-4 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl border-black backdrop-blur"
    >
      <div className="flex">
        <h3 className="flex-grow text-xl font-bold">{c.name}</h3>
        <AddProductDialog categoryId={c.id} action={addProductAction} />
      </div>
      {c.products.length > 0 ? (
        <CategoryTable category={c} />
      ) : (
        <EmptyCategory category={c} />
      )}
    </div>
  );
}

function CategoryTable({ category: c }: CategoryBoxProps) {
  const [sort, setSort] = useState({ id: 0, asc: true });
  const products = useMemo(() => {
    const sortFunc = tableColumns[sort.id].sort;
    return sort.asc
      ? [...c.products].sort(sortFunc)
      : [...c.products].sort(sortFunc).reverse();
  }, [c, sort]);
  return (
    <div className="table w-full m-1">
      <div className="card table-row font-bold">
        {tableColumns.map((c, i) => (
          <div
            key={i}
            className="table-cell border-b-2 border-black px-3 py-1 text-center dark:border-white"
          >
            <a
              onClick={() =>
                setSort({ id: i, asc: sort.id === i ? !sort.asc : true })
              }
              className="cursor-pointer select-none"
            >
              {c.name}
              <Icon
                path={sort.asc ? c.iconAsc : c.iconDesc}
                size={1}
                className={`inline mx-1 text-gray-500${
                  sort.id === i ? "" : " opacity-0"
                }`}
              />
            </a>
          </div>
        ))}
      </div>
      {products.map((p: Product) => (
        <div className="card table-row" key={p.id}>
          {tableColumns.map((c, i) => (
            <div
              key={i}
              className={`table-cell${
                i == 0 ? "" : " border-l"
              } border-black px-3 py-1 align-middle dark:border-white`}
            >
              {c.render(p)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyCategory({ category: c }: CategoryBoxProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="m-2 w-96">
      This category is empty.
      <br />
      <br />
      Use the{" "}
      <Icon
        path={mdiPlusCircle}
        size={1}
        className="inline text-gray-500"
      />{" "}
      Icon in the top right
      <br /> to add a product to this category.
      <br />
      <br />
      Alternatively you may delete this category.
      <br />
      <br />
      <Button onClick={() => setOpen(true)}>Delete Category</Button>
      <SimpleDialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Delete ${c.name}`}
      >
        <div className="m-2">
          Are you sure you want to delete the category
          <span className="font-bold"> {c.name}</span>?
        </div>
        <Button
          color="error"
          className="m-2"
          onClick={async () => {
            await deleteCategory(c.id);
            setOpen(false);
          }}
        >
          Yes, delete {c.name}!
        </Button>
        <Button className="m-2" onClick={() => setOpen(false)}>
          No, close the dialog
        </Button>
      </SimpleDialog>
    </div>
  );
}

function ProductActions({ product: _p }: { product: Product }) {
  return "Actions";
}
