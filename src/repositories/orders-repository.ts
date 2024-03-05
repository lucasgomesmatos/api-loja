export interface OrderProps {
  id: number;
  status: string;
  user_id: string;
  products: number[];
  json: string;
}

export interface OrdersRepository {
  create(data: OrderProps): Promise<void>;
}
