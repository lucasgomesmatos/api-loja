import { ProductsRepository } from "@/repositories/products-repository";
import { ProductAlreadyExistsError } from "../erros/product-already-exists-error";

interface CreateProductUseCaseRequest {
  name: string;
  idWoocommerce: number;
  categories: string[];
}

interface CreateProductUseCaseResponse {
  productId: string;
}

export class CreateProductUseCase {
  constructor(
    private productsRepository: ProductsRepository,
  ) { }

  async execute({
    name,
    idWoocommerce,
    categories,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {

    const productExist = await this.productsRepository.findByName(name);

    if (productExist) {
      throw new ProductAlreadyExistsError();
    }

    const product = await this.productsRepository.create({
      name,
      idWoocommerce,
      categories,
    })

    return { productId: product.id };
  }
}