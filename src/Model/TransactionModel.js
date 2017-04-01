// @flow
import BaseModel from './BaseModel';

export default class TransactionModel extends BaseModel<Transaction> {
  static tableName = 'transaction';
  static idAttribute = 'id';
  format(attributes: Object) {
    // eslint-disable-next-line
    attributes.user_id = attributes.userId;
    delete attributes.userId;
    return attributes;
  }
  parse(attributes: Object) {
    attributes.userId = attributes.user_id;
    return attributes;
  }
}
