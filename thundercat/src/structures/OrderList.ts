import { Order, OrderStatus } from '../models/Order.js';
import { OrderNode } from '../models/OrderNode.js';

export class OrderList {
  private head: OrderNode | null;
  private size: number;

  constructor() {
    this.head = null;
    this.size = 0;
  }

  enqueue(order: Order): void {
    const node = new OrderNode(order);
    if (!this.head) {
      this.head = node;
    } else {
      let cur = this.head;
      while (cur.getNext()) {
        cur = cur.getNext() as OrderNode;
      }
      cur.setNext(node);
    }
    this.size += 1;
  }

  dequeue(): Order | null {
    if (!this.head) return null;
    const node = this.head;
    this.head = node.getNext();
    node.setNext(null);
    this.size = Math.max(0, this.size - 1);
    return node.getOrder();
  }

  /** Remove an order by id from any position in the list. */
  removeById(orderId: string): Order | null {
    if (!this.head) return null;
    if (this.head.getOrder().getId() === orderId) {
      return this.dequeue();
    }
    let prev: OrderNode = this.head;
    let cur = prev.getNext();
    while (cur) {
      if (cur.getOrder().getId() === orderId) {
        prev.setNext(cur.getNext());
        cur.setNext(null);
        this.size = Math.max(0, this.size - 1);
        return cur.getOrder();
      }
      prev = cur;
      cur = cur.getNext();
    }
    return null;
  }

  /** Advance an order if it is in the expected status; returns true if advanced. */
  advanceOrderById(orderId: string, expectedStatus: OrderStatus): boolean {
    let cur = this.head;
    while (cur) {
      const o = cur.getOrder();
      if (o.getId() === orderId && o.getStatus() === expectedStatus) {
        o.advanceStatus();
        return true;
      }
      cur = cur.getNext();
    }
    return false;
  }

  advanceOrder(orderId: string): void {
    let cur = this.head;
    while (cur) {
      if (cur.getOrder().getId() === orderId) {
        cur.getOrder().advanceStatus();
        return;
      }
      cur = cur.getNext();
    }
  }

  toArray(): Order[] {
    const out: Order[] = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.getOrder());
      cur = cur.getNext();
    }
    return out;
  }

  getSize(): number {
    return this.size;
  }
}
