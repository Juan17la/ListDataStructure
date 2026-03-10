import { MenuItem } from './MenuItem.js';

export enum OrderStatus {
  RECIBIDA = 'RECIBIDA',
  EN_COCINA = 'EN_COCINA',
  LISTA = 'LISTA',
  ENTREGADA = 'ENTREGADA',
  CERRADA = 'CERRADA'
}

export class Order {
  private readonly id: string;
  private items: MenuItem[];
  private status: OrderStatus;
  private customerName: string;
  private readonly createdAt: Date;

  constructor(id: string, items: MenuItem[], customerName = 'Customer', createdAt?: Date) {
    if (!id) throw new Error('Order id required');
    if (!items || items.length === 0) throw new Error('Order must have at least one MenuItem');
    this.id = id;
    this.items = items.slice();
    this.status = OrderStatus.RECIBIDA;
    this.customerName = customerName;
    this.createdAt = createdAt ?? new Date();
  }

  getId(): string {
    return this.id;
  }

  getItems(): MenuItem[] {
    return this.items.slice();
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  setCustomerName(name: string): void {
    if (!name) throw new Error('Invalid customer name');
    this.customerName = name;
  }

  getCustomerName(): string {
    return this.customerName;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getTotal(): number {
    return this.items.reduce((s, it) => s + it.getPrice(), 0);
  }

  advanceStatus(): void {
    switch (this.status) {
      case OrderStatus.RECIBIDA:
        this.status = OrderStatus.EN_COCINA;
        break;
      case OrderStatus.EN_COCINA:
        this.status = OrderStatus.LISTA;
        break;
      case OrderStatus.LISTA:
        this.status = OrderStatus.ENTREGADA;
        break;
      case OrderStatus.ENTREGADA:
        this.status = OrderStatus.CERRADA;
        break;
      case OrderStatus.CERRADA:
        // already closed
        break;
      default:
        this.status = OrderStatus.CERRADA;
    }
  }
}
