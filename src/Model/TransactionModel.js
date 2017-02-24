// @flow
import BaseModel from './BaseModel';

export default class UserModel extends BaseModel<Transaction> {
  static tableName = 'Transaction';
  static idAttribute = 'id';
}
