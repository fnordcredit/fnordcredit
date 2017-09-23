// @flow
import { checkUserPin, userHasPin } from 'Service/UserService';

export default async (ctx: KoaRouter$RouterContext, next: Function) => {
  const pin = ctx.request.headers['x-user-pincode'];
  const userid = ctx.request.method === 'GET' ? ctx.params.id : ctx.request.body.id;
  if (userid != null) {
    if (await userHasPin(userid) && pin == "null") {
      ctx.status = 401;
      return;
    }
    await checkUserPin(userid, pin);
  }
  return next();
};
