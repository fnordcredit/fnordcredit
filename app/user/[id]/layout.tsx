import AppBar from "@components/AppBar";

export default function Layout({ children, infocard, productlist }) {
  return (
    <>
      <AppBar></AppBar>
      <div className="flex">
        <div className="mt-4 w-1/4 p-4">{infocard}</div>
        <div className="mx-auto my-4 w-9/12 p-4">
          {productlist}
          {children}
        </div>
      </div>
    </>
  );
}
