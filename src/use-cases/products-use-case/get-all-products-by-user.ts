import { Product } from "@prisma/client";

import { OrdersRepository } from "@/repositories/orders-repository";
import { ProductsRepository } from "@/repositories/products-repository";

interface GetAllProductsByUserUseCaseRequest {
  query: string;
  page: number;
  userId: string;
}

interface GetAllProductsByUserUseCaseResponse {
  products: Product[];
  total: number;
}

export class GetAllProductsByUserUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({
    page,
    query,
    userId,
  }: GetAllProductsByUserUseCaseRequest): Promise<GetAllProductsByUserUseCaseResponse> {
    const orders = await this.ordersRepository.findByUserId(userId);

    const productsOrders = orders.map((order) => order.productsIds);
    const productsIds = String(productsOrders).split(",");

    const productsIdsArray = productsIds.map((id) => Number(id));

    const { products, total } =
      await this.productsRepository.getAllProductsByIdWoocommerce(
        page,
        query,
        productsIdsArray,
      );

    return {
      products,
      total,
    };
  }
}
