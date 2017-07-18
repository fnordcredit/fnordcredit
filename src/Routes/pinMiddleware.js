// @flow
import { checkUserPin } from 'Service/UserService';

export default async (ctx: KoaRouter$RouterContext, next: Function) => {
  const pin = ctx.request.header['X-User-Pincode'];
  if (pin) {
    const username = ctx.request.method === 'GET' ? ctx.params.username : ctx.request.body.username;
    await checkUserPin(username, pin);
  }
  return next();
};
