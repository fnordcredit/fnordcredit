// @flow
import BaseModel from './BaseModel';

export default class UserModel extends BaseModel<User> {
  static tableName = 'user';
  static idAttribute = 'id';
  format(attributes: Object) {
    if (attributes.debtAllowed) {
      // eslint-disable-next-line
      attributes.debt_allowed = attributes.debtAllowed;
      delete attributes.debtAllowed;
    }
    if (attributes.debtHardLimit) {
      // eslint-disable-next-line
      attributes.debt_hard_limit = attributes.debtHardLimit;
      delete attributes.debtHardLimit;
    }
    return attributes;
  }
  parse(attributes: Object) {
    if (attributes.debt_allowed) {
      attributes.debtAllowed = attributes.debt_allowed;
      delete attributes.debt_allowed;
    }
    if (attributes.debt_hard_limit) {
      attributes.debtHardLimit = attributes.debt_hard_limit;
      delete attributes.debt_hard_limit;
    }
    return attributes;
  }
}
