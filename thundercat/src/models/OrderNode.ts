import { Order } from './Order.js';

export class OrderNode {
  private order: Order;
  private next: OrderNode | null;

  constructor(order: Order) {
    this.order = order;
    this.next = null;
  }

  getOrder(): Order {
    return this.order;
  }

  setNext(node: OrderNode | null): void {
    this.next = node;
  }

  getNext(): OrderNode | null {
    return this.next;
  }
}
