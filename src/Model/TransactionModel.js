// @flow
import BaseModel from './BaseModel';

export default class TransactionModel extends BaseModel<Transaction> {
  static tableName = 'Transaction';
  static idAttribute = 'id';
}
