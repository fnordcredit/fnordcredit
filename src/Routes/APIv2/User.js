// @flow
import router from "koa-joi-router";
import {
  addUser,
  deleteUser,
  getAllUsers,
  getUser,
  renameUser,
  updateCredit,
  updatePin,
  updateToken,
  updateAvatar,
} from 'Service/UserService';

async function emit() {
  const users = await getAllUsers();
  //const products = await getAllProducts();
  broadcast('accounts', users);
  //broadcast('products', products);
}

const Joi = router.Joi;

const routes = [{
    path: "/add",
    method: "post",
    meta: {
      swagger: {
        summary: 'Add a new user',
        description: "Adds a new user",
        tags: ["users"]
      },
    },
    validate: {
      type: "json",
      body: Joi.object({
        username: Joi.string().alphanum().max(24).example('abcdefg').description('User name').required()
      }),
      output: {
        200: {
          body: Joi.array().items(Joi.object({
            credit: Joi.number(),
            debtAllowed: Joi.boolean(),
            lastchanged: Joi.date(),
            name: Joi.string()
          }))
        }
      }
    },
    handler: async (ctx) => {
      await addUser(ctx.request.body.username);
      ctx.body = await getAllUsers();
      emit();
    }
  }, {
    path: "/:id",
    method: "get",
    meta: {
      swagger: {
        summary: 'Get the user data',
        description: "Gets the user data based on the id",
        tags: ["users"]
      },
    },
    validate: {
      params: {
        id: Joi.number().required()
      },
      output: {
        200: {
          body: Joi.object({
            id: Joi.number(),
            credit: Joi.number(),
            debtHardLimit: Joi.number(),
            debtAllowed: Joi.boolean(),
            lastchanged: Joi.date(),
            name: Joi.string(),
            pincode: Joi.string().allow(null),
            token: Joi.string().allow(null),
            avatar: Joi.string().allow(null),
            email: Joi.string().allow(null)
          })
        }
      }
    },
    handler: async ctx => {
      const id: number = ctx.params.id;
      ctx.body = await getUser(id);
    }
  }
];

export default routes;
