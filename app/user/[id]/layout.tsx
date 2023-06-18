
export default function Layout({ children, infocard, productlist }) {
  return (
    <div className="flex">
      <div className="w-1/4 mt-4 p-4">
        { infocard }
      </div>
      <div className="w-9/12 p-4 my-4 mx-auto">
        { productlist }
        { children }
      </div>
    </div>
  );
};
