import { Order } from '../models/Order.js';
import { OrderList } from '../structures/OrderList.js';
import { OrderStatus } from '../models/Order.js';

export class UIRenderer {
  private pendingContainer: HTMLElement;
  private attendedContainer: HTMLElement;

  constructor(pendingId: string, attendedId: string) {
    const p = document.getElementById(pendingId);
    const a = document.getElementById(attendedId);
    if (!p) throw new Error(`Container ${pendingId} not found`);
    if (!a) throw new Error(`Container ${attendedId} not found`);
    this.pendingContainer = p;
    this.attendedContainer = a;
  }

  renderPending(orders: Order[], filterText = '', filterStatus?: OrderStatus): void {
    this.pendingContainer.innerHTML = '';
    const filtered = orders.filter((o) => {
      if (filterStatus && o.getStatus() !== filterStatus) return false;
      if (filterText) {
        const q = filterText.toLowerCase();
        if (!o.getCustomerName().toLowerCase().includes(q) && !o.getId().toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No hay órdenes pendientes.';
      this.pendingContainer.appendChild(p);
      return;
    }

    for (const o of filtered) {
      this.pendingContainer.appendChild(this.buildCard(o));
    }
  }

  renderAttended(orders: Order[], from?: Date, to?: Date, filterText = ''): void {
    this.attendedContainer.innerHTML = '';
    const filtered = orders.filter((o) => {
      const t = o.getCreatedAt().getTime();
      if (from && t < from.getTime()) return false;
      if (to && t > to.getTime()) return false;
      if (filterText) {
        const q = filterText.toLowerCase();
        if (!o.getCustomerName().toLowerCase().includes(q) && !o.getId().toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No hay órdenes atendidas.';
      this.attendedContainer.appendChild(p);
      return;
    }

    for (const o of filtered) {
      this.attendedContainer.appendChild(this.buildCard(o, true));
    }
  }

  private buildCard(o: Order, small = false): HTMLElement {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.style.borderLeft = `8px solid ${this.colorForStatus(o.getStatus())}`;

    const title = document.createElement('h3');
    title.textContent = `${o.getCustomerName()} — ${o.getId()}`;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `Estado: ${o.getStatus()} • Creada: ${o.getCreatedAt().toLocaleString()}`;

    const items = document.createElement('ul');
    for (const it of o.getItems()) {
      const li = document.createElement('li');
      li.textContent = `${it.getName()} — $${it.getPrice().toFixed(0)}`;
      items.appendChild(li);
    }

    const total = document.createElement('p');
    total.className = 'total';
    total.textContent = `Total: $${o.getTotal().toFixed(0)}`;

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(items);
    if (!small) card.appendChild(total);

    return card;
  }

  private colorForStatus(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.RECIBIDA:
        return '#6f42c1'; // dark purple
      case OrderStatus.EN_COCINA:
        return '#1e90ff'; // electric/opaque blue
      case OrderStatus.LISTA:
        return '#20c997'; // greenish for ready
      case OrderStatus.ENTREGADA:
        return '#343a40'; // dark/blackish
      case OrderStatus.CERRADA:
        return '#d9534f';
      default:
        return '#000000';
    }
  }
}
