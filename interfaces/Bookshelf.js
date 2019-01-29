/* eslint-disable */

declare type BS$FetchOptions = BS$TransactionOption & {
  columns?: string | string[],
  require?: boolean,
  withRelated?: string | Object | mixed[],
};
declare type BS$SaveOptions = BS$TransactionOption & {|
  defaults?: string,
  method?: 'update' | 'insert',
  path?: boolean,
  require?: boolean,
|};
declare type BS$DestroyOptions = BS$TransactionOption & {
  require?: boolean,
};
declare type BS$SerializeOptions = {
  shallow?: boolean,
  omitPivot?: boolean,
};

declare type BS$TransactionOption = {
  transacting?: Knex$Transaction<*>,
  query?: any,

  session?: any,
  skipHistory?: boolean,
};

declare class BS$Bookshelf {
  static [[call]](knex: Knex$Knex<*>): this,
  Model: typeof BS$Model,
  Collection: typeof BS$Collection,
  transaction(trxFn: (trx: Knex$Transaction<*>) => ?Promise<*>): Promise<*>,
  knex: Knex$Knex<*>,
}
declare class BS$Collection<M: Object, SpecificModel: BS$Model<M>> {
  // Technically wrong! this is a crude hack
  static [[call]]: this,
  constructor(
    models?: SpecificModel[],
    options?: { comparator?: boolean },
  ): this,
  static extend(
    prototypeProperties?: Object,
    classProperties?: Object,
  ): BS$Collection<*>,
  add(
    models: this | $Shape<M> | $Shape<M>[] | SpecificModel | SpecificModel[],
    options?: { at?: number, merge?: boolean },
  ): this,
  at(index: number): SpecificModel,
  attach(ids: mixed | mixed[], options?: BS$TransactionOption): Promise<this>,
  clone(): this,
  count(column?: string, options?: Object): Promise<number>,
  create<A: Object, B: BS$Model<A>>(
    model: $Shape<A>,
    options?: BS$TransactionOption,
  ): Promise<B>,
  detach(ids?: mixed | mixed[], options?: BS$TransactionOption): Promise<void>,
  fetch(
    options?: { require?: boolean, withRelated?: string | string[] },
  ): Promise<this>,
  fetchOne(
    options?: {
      require?: boolean,
      columns?: string | string[],
      transacting?: Knex$Transaction<*>,
    },
  ): Promise<SpecificModel>,
  findWhere(): SpecificModel,
  get(where: mixed): BS$Model<*>,
  invokeThen(method: string, ...args: mixed[]): Promise<*>,
  load(
    relations: string | string[],
    options?: BS$TransactionOption,
  ): Promise<this>,
  off(eventName?: string): void,
  on(eventName: string, cb: Function): void,
  once(eventName: string, cb: Function): void,
  parse(resp: Object[]): Object[],
  pluck(key: $Keys<M>): any[],
  pop(): void,
  push(model: M | SpecificModel | M[] | SpecificModel[]): this,
  query(arguments: (qb: Knex$QueryBuilder<*>) => mixed | Object | string): this,
  query(): Knex$QueryBuilder<*>,
  reduceThen(
    iterator: Function,
    initialValue: mixed,
    context: Object,
  ): Promise<mixed[]>,
  remove<A: SpecificModel | SpecificModel[]>(models: A): A,
  reset(
    models: SpecificModel | M | SpecificModel[] | M[],
    options?: { at?: number, merge?: boolean },
  ): BS$Model<*>[],
  resetQuery(): this,
  serialize(): M[],
  serialize(options: BS$SerializeOptions): any,
  set(
    models: M | SpecificModel | M[] | SpecificModel[],
    options?: { add?: boolean, remove?: boolean, merge?: boolean },
  ): this,
  shift(): this,
  slice(): this,
  through(): this,
  toJSON(options?: BS$SerializeOptions): mixed,
  trigger(eventName: string): void,
  triggerThen(eventName: string, ...args?: mixed[]): Promise<*>,
  unshift(model: M): this,
  updatePivot(
    attributes: Object,
    options?: {
      query?: Function | Object,
      require?: boolean,
      transacting?: Knex$Transaction<*>,
    },
  ): Promise<number>,
  where(subset: $Shape<M>): SpecificModel[],
  where(column: $Keys<M>, value: mixed): SpecificModel[],
  where(column: $Keys<M>, operator: string, value: mixed): SpecificModel[],
  withPivot(columns?: string[]): this,

  //lodash
  chain(): any,
  countBy(): any,
  difference(): any,
  drop(): any,
  each(): any,
  every(fn: ?(e: SpecificModel) => boolean): boolean,
  filter(fn: ?(e: SpecificModel) => boolean): SpecificModel[],
  find(fn: ?(e: SpecificModel) => boolean): ?SpecificModel,
  first(): SpecificModel,
  forEach(fn: (model: SpecificModel, index: number) => mixed): any,
  groupBy(field: $Keys<M>): { [key: string]: ?(SpecificModel[]) },
  groupBy(fn: (e: SpecificModel) => any): { [key: string]: ?(SpecificModel[]) },
  head(): SpecificModel,
  includes(): any,
  indexOf(): any,
  initial(): any,
  invokeMap(): any,
  isEmpty(): boolean,
  last(): SpecificModel,
  lastIndexOf(): any,
  map<T>(fn: (model: SpecificModel, index: number) => T): T[],
  maxBy(fn: (model: SpecificModel) => any): SpecificModel,
  minBy(fn: (model: SpecificModel) => any): SpecificModel,
  reduce(): any,
  reduceRight(): any,
  reject(): any,
  shuffle(): any,
  size(): number,
  some(fn: ?(e: SpecificModel) => boolean): boolean,
  sortBy(): any,
  tail(): any,
  take(): any,
  toArray(): any,
  without(): any,
}

declare class BS$Model<T: Object> {
  static extend: Function,
  static collection(): BS$Collection<T, this>,
  static query(args: (qb: Knex$QueryBuilder<*>) => any): this,
  static where(subset: $Shape<T>): this,
  static where(column: $Keys<T>, value: mixed): this,
  static where(column: $Keys<T>, operator: string, value: mixed): this,
  static valueName: string,

  collection: () => BS$Collection<T, this>,
  changed: $Shape<T>,
  _previousAttributes: T,
  attributes: T,
  constructor(
    attrs: $Shape<T>,
    options?: { tableName?: string, hasTimestamps?: boolean, parse?: boolean },
  ): this,
  belongsTo<A, B: Class<A>>(target: B, foreignKey?: string): A,
  belongsToMany<A, B: BS$Model<A>, T: Class<B>>(
    target: T,
    foreignKey?: string,
    otherKey?: string,
  ): BS$Collection<A, B>,
  clear(): this,
  clone(): this,
  count(column?: $Keys<T>, options?: Object): Promise<number>,
  destroy(options?: BS$DestroyOptions): Promise<this>,
  escape(attribute: string): string,
  fetch(options?: BS$FetchOptions): Promise<?this>,
  fetchAll(options?: BS$FetchOptions): Promise<BS$Collection<T, this>>,
  static fetchAll(options?: BS$FetchOptions): Promise<BS$Collection<T, this>>,
  format(attributes: $Shape<T>): $Shape<T>,
  get(attribute: $Keys<T>): any,
  has(attribute: $Keys<T>): boolean,
  hasChanged(attribute?: $Keys<T>): boolean,
  hasMany<A, B: BS$Model<A>, T: Class<B>>(
    target: T,
    foreignKey?: string,
  ): BS$Collection<A, B>,
  hasOne<A: BS$Model<*>, B: Class<A>>(target: B, foreignKey?: string): A,
  isNew(): boolean,
  load(
    relations: string | string[],
    options?: { transacting?: Knex$Transaction<*> },
  ): Promise<this>,
  morphMany<A: BS$Model<*>>(
    target: A,
    name?: string,
    columnNames?: string[],
    morphValue?: string,
  ): BS$Collection<A>,
  morphOne<A: BS$Model<*>>(
    target: A,
    name?: string,
    columnNames?: string[],
    morphValue?: string,
  ): A,
  morphTo(name: string, ...target: BS$Model<*>[]): BS$Model<*>,
  morphTo(
    name: string,
    columnNames: string[],
    ...target: BS$Model<*>[]
  ): BS$Model<*>,
  off(eventName?: string): void,
  on(eventName: string, cb: Function): void,
  once(nameOrNames: string, cb: Function): void,
  parse(response: Object): Object,
  previous(attribute: $Keys<T>): mixed,
  previousAttributes(): $Shape<T>,
  query(args: (qb: Knex$QueryBuilder<*>) => any): this,
  refresh(options?: BS$FetchOptions): Promise<this>,
  related(name: string): ?(BS$Model<any> | BS$Collection<any>),
  resetQuery(): this,
  serialize(): T,
  serialize(options: BS$SerializeOptions): Object,
  save(): Promise<this>,
  save(attrs: Object, options?: BS$SaveOptions): Promise<this>,
  save(key: $Keys<T>, val: string, options?: BS$SaveOptions): Promise<this>,
  set(attributes: $Shape<T>, options?: { unset?: Object }): this,
  set(key?: string, val?: any, options?: { unset?: Object }): this,
  through(
    interim: BS$Model<*>,
    throughForeignKey?: string,
    otherKey?: string,
  ): BS$Model<*>,
  timestamp(options?: { method?: 'insert' | 'update' }): Object,
  toJSON(options?: BS$SerializeOptions): string,
  trigger(eventName: string): void,
  triggerThen(eventName: string, ...args?: mixed[]): Promise<*>,
  unset(attribute: $Keys<T>): this,
  where(subset: $Shape<T>): this,
  where(column: $Keys<T>, value: mixed): this,
  where(column: $Keys<T>, operator: string, value: mixed): this,

  keys(): $Keys<T>[],
  id: number,
}

declare module 'bookshelf' {
  declare module.exports: typeof BS$Bookshelf;
}
