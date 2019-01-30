// @flow
import BaseModel from './BaseModel';

export default class TransactionModel extends BaseModel<Transaction> {
  static tableName = 'transaction';
  static idAttribute = 'id';
  format(attributes: Object) {
    if (attributes.userId) {
      // eslint-disable-next-line
      attributes.user_id = attributes.userId;
      delete attributes.userId;
    }
    return attributes;
  }
  parse(attributes: Object) {
    if (attributes.user_id) {
      attributes.userId = attributes.user_id;
      delete attributes.user_id;
    }
    return attributes;
  }
}
