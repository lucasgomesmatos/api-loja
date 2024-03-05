import { UserAlreadyExistsError } from "@/use-cases/erros/user-already-exists-error";
import { makeRegisterUserStoreUseCase } from "@/use-cases/factories/make-register-user-store-use-case";

import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function registerUserStore(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerUserStoreBodySchema = z.object({
    id: z.number(),
    status: z.enum(["pending", "completed", "canceled"]),
    billing: z.object({
      first_name: z.string(),
      last_name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      cpf: z.string().optional(),
    }),
    line_items: z.array(
      z.object({
        id: z.number(),
        product_id: z.number(),
        name: z.string(),
        price: z.number(),
      }),
    ),
  });

  const { id, status, billing, line_items } = registerUserStoreBodySchema.parse(
    request.body,
  );

  const billingParams = {
    firstName: billing.first_name,
    lastName: billing.last_name,
    email: billing.email,
    phone: billing.phone,
    cpf: billing.cpf,
  };

  const lineItemsParams = line_items.map((lineItem) => {
    return {
      id: lineItem.id,
      name: lineItem.name,
      productId: lineItem.product_id,
      price: lineItem.price,
    };
  });

  try {
    const registerUserStoreUseCase = makeRegisterUserStoreUseCase();

    registerUserStoreUseCase.execute({
      id,
      status,
      billing: billingParams,
      lineItems: lineItemsParams,
    });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(422).send({
        message: error.message,
      });
    }
    throw error;
  }

  return reply.status(201).send();
}
