// @flow
export default {
  debtAllowed: Boolean(process.env.ALLOW_DEBT),
  maxDebt: Number.parseInt(process.env.MAX_DEBT || '-100', 10) || -100,
};
