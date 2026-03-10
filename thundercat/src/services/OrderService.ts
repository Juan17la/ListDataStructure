import { Order, OrderStatus } from '../models/Order.js';
import { OrderList } from '../structures/OrderList.js';
import { MenuItem } from '../models/MenuItem.js';

export class OrderService {
  private list: OrderList;
  private attended: Order[];

  constructor(list: OrderList) {
    this.list = list;
    this.attended = [];
  }

  createOrder(id: string, items: MenuItem[], customerName?: string, createdAt?: Date): Order {
    const order = new Order(id, items, customerName ?? 'Customer', createdAt);
    this.list.enqueue(order);
    return order;
  }

  createRandomOrder(id: string, menu: MenuItem[], customerName = 'Customer'): Order {
    if (menu.length === 0) throw new Error('Menu is empty');
    const count = Math.floor(Math.random() * Math.min(3, menu.length)) + 1;
    const items: MenuItem[] = [];
    for (let i = 0; i < count; i++) {
      const m = menu[Math.floor(Math.random() * menu.length)];
      items.push(m);
    }
    return this.createOrder(id, items, customerName);
  }

  advanceFirstOrderToAttended(): void {
    const order = this.list.dequeue();
    if (!order) return;
    // advance until served (LISTA -> ENTREGADA) or closed
    while (order.getStatus() !== OrderStatus.ENTREGADA && order.getStatus() !== OrderStatus.CERRADA) {
      order.advanceStatus();
    }
    // mark as attended (keep final status)
    this.attended.push(order);
  }

  getPendingOrders(): Order[] {
    return this.list.toArray();
  }

  getAttendedOrders(): Order[] {
    return this.attended.slice();
  }

  filterAttendedByDate(from?: Date, to?: Date): Order[] {
    return this.attended.filter((o) => {
      const t = o.getCreatedAt().getTime();
      if (from && t < from.getTime()) return false;
      if (to && t > to.getTime()) return false;
      return true;
    });
  }
}
