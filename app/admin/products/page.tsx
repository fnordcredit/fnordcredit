import prisma from "@lib/prisma";
import AppBar from "@components/AppBar";
import CategoryBox from "./CategoryBox";
import AddCategory from "./AddCategory";

export default async function ProductPage() {
  const cats = await prisma.productCategory.findMany({
    include: {
      products: {
        orderBy: {
          id: "asc",
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
  return (
    <>
      <AppBar>
        <div className="flex-grow" />
        <AddCategory />
      </AppBar>
      <div className="flex flex-wrap m-4">
        {cats.map((c, i) => (
          <CategoryBox category={c} key={i} />
        ))}
      </div>
    </>
  );
}
