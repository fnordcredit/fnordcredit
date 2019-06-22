// @flow

export default class TransactionModel extends bookshelf.Model<Transaction> {
  get tableName() {
    return 'transaction';
  }
  get idAttribute() {
    return 'id';
  }
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
