import { Product } from "@prisma/client";

import { ProductsRepository } from "@/repositories/products-repository";

interface GetAllProductsUseCaseRequest {
  query: string;
  page: number;
  categories: string[] | undefined;
}

interface GetAllProductsUseCaseResponse {
  products: Product[];
  total: number;
}

export class GetAllProductsUseCase {
  constructor(private readonly productsRepository: ProductsRepository) { }

  async execute({
    page,
    query,
    categories,
  }: GetAllProductsUseCaseRequest): Promise<GetAllProductsUseCaseResponse> {
    const { products, total } = await this.productsRepository.findAllProducts({
      page,
      query,
      categories,
    });

    return {
      products,
      total,
    };
  }
}
