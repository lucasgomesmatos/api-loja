import { Product } from "@prisma/client";
import { ProductsRepository } from "./../repositories/products-repository";

interface GetAllProductsUseCaseRequest {
  query: string;
  page: number;
  categories: string[];
}

interface GetAllProductsUseCaseResponse {
  products: Product[];
}

export class GetAllProductsUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    page,
    query,
    categories,
  }: GetAllProductsUseCaseRequest): Promise<GetAllProductsUseCaseResponse> {
    const products = await this.productsRepository.findAllProducts({
      page,
      query,
      categories,
    });

    return {
      products,
    };
  }
}
