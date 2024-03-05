"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/use-cases/register-user-store.ts
var register_user_store_exports = {};
__export(register_user_store_exports, {
  RegisterUserStoreUseCase: () => RegisterUserStoreUseCase
});
module.exports = __toCommonJS(register_user_store_exports);
var import_bcryptjs = require("bcryptjs");
var RegisterUserStoreUseCase = class {
  constructor(usersStoreRepository, ordersRepository) {
    this.usersStoreRepository = usersStoreRepository;
    this.ordersRepository = ordersRepository;
  }
  async execute({
    id,
    status,
    billing,
    line_items
  }) {
    const userEmailExists = await this.usersStoreRepository.findByEmail(
      billing.email
    );
    if (userEmailExists) {
      this.createOrder({ id, status, line_items }, userEmailExists.id);
      return;
    }
    const passwordHash = await (0, import_bcryptjs.hash)(billing.cpf, 6);
    const user = await this.usersStoreRepository.create({
      name: billing.first_name.concat(" ", billing.last_name),
      email: billing.email,
      password_hash: passwordHash,
      phone: billing.phone,
      cpf: billing.cpf
    });
    this.createOrder({ id, status, line_items }, user.id);
  }
  async createOrder(data, userId) {
    const { id, status, line_items } = data;
    const productsIds = line_items.map((item) => item.product_id);
    this.ordersRepository.create({
      id,
      status,
      user_id: userId,
      products: productsIds,
      json: JSON.stringify({
        data,
        userId
      })
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RegisterUserStoreUseCase
});
