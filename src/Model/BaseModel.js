// @flow

export default class BaseModel<T: Object> extends bookshelf.Model<T> {
  idAttribute: string;
  static idAttribute: string;
  static tableName: string;
  get tableName(): string {
    return this.constructor.tableName;
  }
  get idAttribute(): string {
    return this.constructor.idAttribute;
  }
}
