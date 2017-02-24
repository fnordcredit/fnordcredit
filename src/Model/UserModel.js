// @flow
import BaseModel from './BaseModel';

export default class UserModel extends BaseModel<User> {
  static tableName = 'user';
  static idAttribute = 'name';
  format(attributes: Object) {
    // eslint-disable-next-line
    attributes.debt_allowed = attributes.debtAllowed;
    // eslint-disable-next-line
    attributes.debt_hard_limit = attributes.debtHardLimit;
    delete attributes.debtAllowed;
    delete attributes.debtHardLimit;
    return attributes;
  }
  parse(attributes: Object) {
    attributes.debtAllowed = attributes.debt_allowed;
    attributes.debtHardLimit = attributes.debt_hard_limit;
    return attributes;
  }
}
