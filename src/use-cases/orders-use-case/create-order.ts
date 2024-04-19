import { OrdersRepository } from "@/repositories/orders-repository";
import { OrderAlreadyExistsError } from "../erros/order-already-exists-error";

interface LineItemsProps {
  id: number;
  name: string;
  productId: number;
  price: number;
}

interface CreateOrderUseCaseRequest {
  id: number;
  status: "pending" | "completed" | "canceled";
  lineItems: LineItemsProps[];
  userId: string;
}

export class CreateOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    id,
    status,
    lineItems,
    userId,
  }: CreateOrderUseCaseRequest): Promise<void> {
    
    const order = await this.ordersRepository.findById(id);

    if (order) {
      throw new OrderAlreadyExistsError();
    }

    const productsIds = lineItems
      .map((lineItem) => lineItem.productId)
      .join(",");

    await this.ordersRepository.create({
      id,
      status,
      userId,
      productsIds,
      json: JSON.stringify(lineItems),
    });
  }
}
