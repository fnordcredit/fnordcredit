import AppBar from "@components/AppBar";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  infocard: ReactNode;
  productlist: ReactNode;
};

export default function Layout({
  children,
  infocard,
  productlist,
}: LayoutProps) {
  return (
    <>
      <AppBar
        className="max-xl:bg-transparent sm:max-xl:-mb-16 sm:flex hidden"
        titleClassName="xl:block hidden"
      ></AppBar>
      <div className="xl:flex">
        <div className="w-full xl:mt-4 2xl:w-1/4 xl:w-1/3 xl:p-4">
          {infocard}
        </div>
        <div className="mx-auto my-4 w-9/12 p-4">
          {productlist}
          {children}
        </div>
      </div>
    </>
  );
}
