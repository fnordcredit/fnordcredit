declare type User = {
  credit: number,
  debtAllowed: bool,
  debtHardLimit?: number,
  id: number,
  lastchanged: Date,
  name: string,
  pincode?: string,
  token?: string,
}
