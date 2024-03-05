export interface OrderProps {
  id: number;
  status: string;
  userId: string;
  productsIds: string;
  json: string;
}

export interface OrdersRepository {
  create(data: OrderProps): Promise<void>;
}
