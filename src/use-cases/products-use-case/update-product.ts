import { ResourceNotFoundError } from "../erros/resource-not-found-error";

import { ProductsRepository } from "@/repositories/products-repository";

interface UpdateProductUseCaseRequest {
  productId: string;
  name: string;
  idWoocommerce: number;
  categories: string[];
}

export class UpdateProductUseCase {
  constructor(
    private productsRepository: ProductsRepository,
  ) { }

  async execute({
    productId,
    name,
    idWoocommerce,
    categories,
  }: UpdateProductUseCaseRequest): Promise<void> {

    const productExist = await this.productsRepository.findById(productId);

    if (!productExist) {
      throw new ResourceNotFoundError();
    }

    await this.productsRepository.updateById(productId, {
      name,
      idWoocommerce,
      categories,
    })
  }
}