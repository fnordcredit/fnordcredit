// @flow

export default class ProductModel extends bookshelf.Model<Product> {
  get tableName() {
    return 'products';
  }
  get idAttribute() {
    return 'id';
  }
  format(attributes: Object) {
    if (attributes.imagePath) {
      attributes.image_path = attributes.imagePath;
      delete attributes.imagePath;
    }
    attributes.price = Math.floor(attributes.price * 100);
    return attributes;
  }
  parse(attributes: Object) {
    if (attributes.image_path) {
      attributes.imagePath = attributes.image_path;
      delete attributes.image_path;
    }
    attributes.price = attributes.price / 100;
    return attributes;
  }
}
