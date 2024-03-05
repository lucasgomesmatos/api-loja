import { OrdersRepository } from "@/repositories/orders-repository";
import { UsersStoreRepository } from "@/repositories/users-store-repository";
import { hash } from "bcryptjs";

interface BillingProps {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | undefined;
  cpf?: string | undefined;
}

interface LineItemsProps {
  id: number;
  name: string;
  productId: number;
  price: number;
}

interface RegisterUseCaseRequest {
  id: number;
  status: "pending" | "completed" | "canceled";
  billing: BillingProps;
  lineItems: LineItemsProps[];
}

export class RegisterUserStoreUseCase {
  constructor(
    private usersStoreRepository: UsersStoreRepository,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({
    id,
    status,
    billing,
    lineItems,
  }: RegisterUseCaseRequest): Promise<void> {
    const userEmailExists = await this.usersStoreRepository.findByEmail(
      billing.email,
    );

    if (userEmailExists) {
      this.createOrder({ id, status, lineItems }, userEmailExists.id);
      return;
    }

    const passwordHash = await hash(billing.cpf!, 6);

    const user = await this.usersStoreRepository.create({
      name: billing.firstName.concat(" ", billing.lastName),
      email: billing.email,
      password_hash: passwordHash,
      phone: billing.phone,
      cpf: billing.cpf,
    });

    this.createOrder({ id, status, lineItems }, user.id);
  }

  private async createOrder(
    data: Omit<RegisterUseCaseRequest, "billing">,
    userId: string,
  ) {
    const { id, status, lineItems } = data;

    const productsIds = lineItems.map((item) => item.productId).join(",");

    this.ordersRepository.create({
      id,
      status,
      userId,
      productsIds,
      json: JSON.stringify({
        data,
        userId,
      }),
    });
  }
}
