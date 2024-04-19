import { sendMailCreateAccount } from "@/mail/nodemailer";
import { OrderAlreadyExistsError } from "@/use-cases/erros/order-already-exists-error";
import { makeCreateOrderStoreUseCase } from "@/use-cases/factories/make-create-order-store-use-case";
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

    if (status !== "completed") return;

    const registerUserStoreUseCase = makeRegisterUserStoreUseCase();
    const createOrderStoreUseCase = makeCreateOrderStoreUseCase();

    const { user } = await registerUserStoreUseCase.execute(billingParams);

    await createOrderStoreUseCase.execute({
      id,
      status,
      lineItems: lineItemsParams,
      userId: user?.id as string,
    });

    const token = await reply.jwtSign(
      {
        role: user?.role,
      },
      {
        sign: {
          sub: user?.id,
          expiresIn: "7d",
        },
      },
    );

    await sendMailCreateAccount(user?.name, user?.email, token);
  } catch (error: unknown) {
    if (error instanceof OrderAlreadyExistsError) {
      console.error("Order already exists");
      return reply.status(400).send({ message: "Order already exists" });
    }

    throw error;
  }

  return reply.status(201).send();
}
