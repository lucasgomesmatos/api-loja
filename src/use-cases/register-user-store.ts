import { OrdersRepository } from "@/repositories/orders-repository";
import { UsersStoreRepository } from "@/repositories/users-store-repository";
import { hash } from "bcryptjs";

interface BillingProps {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | undefined;
  cpf?: string | undefined;
}

interface LineItemsProps {
  id: number;
  name: string;
  product_id: number;
  price: number;
}

interface RegisterUseCaseRequest {
  id: number;
  status: "pending" | "completed" | "canceled";
  billing: BillingProps;
  line_items: LineItemsProps[];
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
    line_items,
  }: RegisterUseCaseRequest): Promise<void> {
    const userEmailExists = await this.usersStoreRepository.findByEmail(
      billing.email,
    );

    if (userEmailExists) {
      this.createOrder({ id, status, line_items }, userEmailExists.id);
      return;
    }

    const passwordHash = await hash(billing.cpf!, 6);

    const user = await this.usersStoreRepository.create({
      name: billing.first_name.concat(" ", billing.last_name),
      email: billing.email,
      password_hash: passwordHash,
      phone: billing.phone,
      cpf: billing.cpf,
    });

    this.createOrder({ id, status, line_items }, user.id);
  }

  private async createOrder(
    data: Omit<RegisterUseCaseRequest, "billing">,
    userId: string,
  ) {
    const { id, status, line_items } = data;

    const productsIds = line_items.map((item) => item.product_id);

    this.ordersRepository.create({
      id,
      status,
      user_id: userId,
      products: productsIds,
      json: JSON.stringify({
        data,
        userId,
      }),
    });
  }
}
