// @flow
import BaseModel from './BaseModel';

export default class ProductModel extends BaseModel<Product> {
  static tableName = 'products';
  static idAttribute = 'id';
  format(attributes: Object) {
    attributes.image_path = attributes.imagePath;
    attributes.price = Math.floor(attributes.price * 100);
    delete attributes.imagePath;
    return attributes;
  }
  parse(attributes: Object) {
    attributes.imagePath = attributes.image_path;
    attributes.price = attributes.price / 100;
    return attributes;
  }
}
