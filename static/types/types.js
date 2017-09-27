type User = {
  credit: number,
  id: number,
  lastchanged: number,
  name: string
};

type Product = {
  id: number,
  name: string,
  price: number,
  category: string,
  ean: string,
  imagePath: string
};

type Sorting = "abc"|"zyx"|"last";
