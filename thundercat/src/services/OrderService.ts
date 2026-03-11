import { Order, OrderStatus } from '../models/Order.js';
import { OrderList } from '../structures/OrderList.js';
import { MenuItem } from '../models/MenuItem.js';

export class OrderService {
  // Active orders: RECIBIDA → LISTA → ENTREGADA
  private list: OrderList;
  // Billing phase: CUENTA_SOLICITADA → CALCULADA
  private billing: Order[];
  // Completed: PAGADA
  private paid: Order[];

  constructor(list: OrderList) {
    this.list = list;
    this.billing = [];
    this.paid = [];
  }

  // ─── CLIENTE: Solicitar pedido ────────────────────────────────────────────
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
      items.push(menu[Math.floor(Math.random() * menu.length)]);
    }
    return this.createOrder(id, items, customerName);
  }

  // ─── MOZO: Recoger pedido (RECIBIDA → EN_COCINA) ──────────────────────────
  mozoRecogerPedido(orderId: string): void {
    this.list.advanceOrderById(orderId, OrderStatus.RECIBIDA);
  }

  // ─── COCINA: Elaborar pedido — pedido listo (EN_COCINA → LISTA) ───────────
  cocinaElaborarPedido(orderId: string): void {
    this.list.advanceOrderById(orderId, OrderStatus.EN_COCINA);
  }

  // ─── MOZO: Servir pedido (LISTA → ENTREGADA) ──────────────────────────────
  mozoServirPedido(orderId: string): void {
    this.list.advanceOrderById(orderId, OrderStatus.LISTA);
  }

  // ─── CLIENTE + MOZO: Solicitar/pedir cuenta (ENTREGADA → CUENTA_SOLICITADA)
  solicitarCuenta(orderId: string): void {
    const order = this.list.removeById(orderId);
    if (!order) return;
    if (order.getStatus() !== OrderStatus.ENTREGADA) {
      this.list.enqueue(order); // put it back if wrong state
      return;
    }
    order.advanceStatus(); // ENTREGADA → CUENTA_SOLICITADA
    this.billing.push(order);
  }

  // ─── CAJA: Calcular total (CUENTA_SOLICITADA → CALCULADA) ─────────────────
  cajaCalcularTotal(orderId: string): void {
    const order = this.billing.find((o) => o.getId() === orderId);
    if (!order || order.getStatus() !== OrderStatus.CUENTA_SOLICITADA) return;
    order.advanceStatus(); // CUENTA_SOLICITADA → CALCULADA
  }

  // ─── CLIENTE: Pagar pedido (CALCULADA → PAGADA) ───────────────────────────
  clientePagar(orderId: string): void {
    const idx = this.billing.findIndex((o) => o.getId() === orderId);
    if (idx === -1) return;
    const order = this.billing[idx];
    if (order.getStatus() !== OrderStatus.CALCULADA) return;
    order.advanceStatus(); // CALCULADA → PAGADA
    this.billing.splice(idx, 1);
    this.paid.push(order);
  }

  // ─── Queries ──────────────────────────────────────────────────────────────
  getPendingOrders(): Order[] {
    return this.list.toArray();
  }

  getBillingOrders(): Order[] {
    return this.billing.slice();
  }

  getPaidOrders(): Order[] {
    return this.paid.slice();
  }

  getAttendedOrders(): Order[] {
    return [...this.billing, ...this.paid];
  }

  filterAttendedByDate(from?: Date, to?: Date): Order[] {
    return this.getAttendedOrders().filter((o) => {
      const t = o.getCreatedAt().getTime();
      if (from && t < from.getTime()) return false;
      if (to && t > to.getTime()) return false;
      return true;
    });
  }
}
