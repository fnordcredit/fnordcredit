declare type User = {
  credit: number,
  debtAllowed: bool,
  debtHardLimit?: number,
  lastchanged: Date,
  name: string,
  pincode?: string,
  token?: string,
}
