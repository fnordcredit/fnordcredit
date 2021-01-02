// @flow
import router from "koa-joi-router";

import user from "./User";

const userRouter = router()
userRouter.prefix("/api/v2/user");
userRouter.route(user);

console.log(userRouter.routes);

koa.use(userRouter.middleware());
