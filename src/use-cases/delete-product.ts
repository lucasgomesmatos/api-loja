import { ProductsRepository } from "@/repositories/products-repository";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";

interface DeleteProductUseCaseRequest {
  productId: string;
}

interface DeleteProductUseCaseResponse {
  productId: string;
}

export class DeleteProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    productId,
  }: DeleteProductUseCaseRequest): Promise<DeleteProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);

    if (!product) throw new ResourceNotFoundError();

    return {
      productId: product.id!,
    };
  }
}
