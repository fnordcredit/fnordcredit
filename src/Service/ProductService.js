import ProductModel from "../Model/ProductModel";

export function getAllProducts() {
  return ProductModel.fetchAll({
    columns: ['id', 'name', 'price', 'category', 'ean', 'image_path'],
  });
}
