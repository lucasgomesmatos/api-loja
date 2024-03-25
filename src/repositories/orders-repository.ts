import { Order } from "@prisma/client";

export interface OrderProps {
  id: number;
  status: string;
  userId: string;
  productsIds: string;
  json: string;
}

export interface OrdersRepository {
  create(data: OrderProps): Promise<void>;
  findByUserId(userId: string): Promise<Order[]>;

  findById(id: number): Promise<Order | null>;
}
