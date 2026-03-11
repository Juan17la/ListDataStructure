import { Order, OrderStatus } from '../models/Order.js';

type ActionCb = (orderId: string) => void;

export interface RenderCallbacks {
  onRecoger: ActionCb;         // Mozo: RECIBIDA → EN_COCINA
  onElaborar: ActionCb;        // Cocina: EN_COCINA → LISTA
  onServir: ActionCb;          // Mozo: LISTA → ENTREGADA
  onSolicitarCuenta: ActionCb; // Cliente: ENTREGADA → CUENTA_SOLICITADA
  onCalcular: ActionCb;        // Caja: CUENTA_SOLICITADA → CALCULADA
  onPagar: ActionCb;           // Cliente: CALCULADA → PAGADA
}

export class UIRenderer {
  private els: Record<string, HTMLElement> = {};

  constructor() {
    const ids = [
      'lane-recibidas',
      'lane-en-cocina',
      'lane-listas',
      'lane-entregadas',
      'lane-caja-recibir',
      'lane-caja-esperar',
      'lane-cuentas',
      'lane-calculadas',
      'lane-boletas',
      'lane-pagadas',
    ];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) throw new Error(`#${id} not found`);
      this.els[id] = el;
    }
  }

  render(allOrders: Order[], cb: RenderCallbacks): void {
    const by = (s: OrderStatus) => allOrders.filter((o) => o.getStatus() === s);

    // ── MOZO ──────────────────────────────────────────────────────────────
    this.fill('lane-recibidas', by(OrderStatus.RECIBIDA),
      'Recoger Pedido', cb.onRecoger);

    this.fill('lane-listas', by(OrderStatus.LISTA),
      'Servir Pedido', cb.onServir);

    // ── COCINA ────────────────────────────────────────────────────────────
    this.fill('lane-en-cocina', by(OrderStatus.EN_COCINA),
      'Pedido Listo ✓', cb.onElaborar);

    // ── CAJA ──────────────────────────────────────────────────────────────
    // Recibir pedido: mirror of EN_COCINA (read-only)
    this.fill('lane-caja-recibir', by(OrderStatus.EN_COCINA), null, null);
    // Esperar: mirror of ENTREGADA (read-only — wait for bill request)
    this.fill('lane-caja-esperar', by(OrderStatus.ENTREGADA), null, null);
    // Calcular total
    this.fill('lane-cuentas', by(OrderStatus.CUENTA_SOLICITADA),
      'Calcular Total', cb.onCalcular);
    // Boleta: shows CALCULADA (waiting payment) + PAGADA (history)
    this.fill('lane-boletas',
      [...by(OrderStatus.CALCULADA), ...by(OrderStatus.PAGADA)],
      null, null, true);

    // ── CLIENTE ───────────────────────────────────────────────────────────
    this.fill('lane-entregadas', by(OrderStatus.ENTREGADA),
      'Solicitar Cuenta', cb.onSolicitarCuenta);

    this.fill('lane-calculadas', by(OrderStatus.CALCULADA),
      'Pagar Pedido 💳', cb.onPagar);

    this.fill('lane-pagadas', by(OrderStatus.PAGADA), null, null);
  }

  private fill(
    id: string,
    orders: Order[],
    actionLabel: string | null,
    onAction: ActionCb | null,
    showReceipt = false,
  ): void {
    const container = this.els[id];
    container.innerHTML = '';

    if (orders.length === 0) {
      const p = document.createElement('p');
      p.className = 'empty-msg';
      p.textContent = '—';
      container.appendChild(p);
      return;
    }

    for (const o of orders) {
      container.appendChild(this.buildCard(o, actionLabel, onAction, showReceipt));
    }
  }

  private buildCard(
    o: Order,
    actionLabel: string | null,
    onAction: ActionCb | null,
    showReceipt: boolean,
  ): HTMLElement {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.style.borderLeftColor = this.colorForStatus(o.getStatus());

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = `${o.getCustomerName()} · #${o.getId().slice(-6)}`;

    const badge = document.createElement('span');
    badge.className = 'status-badge';
    badge.textContent = o.getStatus().replace(/_/g, ' ');

    const itemList = document.createElement('ul');
    itemList.className = 'card-items';
    for (const it of o.getItems()) {
      const li = document.createElement('li');
      li.textContent = `${it.getName()} — $${it.getPrice().toFixed(0)}`;
      itemList.appendChild(li);
    }

    const totalEl = document.createElement('div');
    totalEl.className = 'card-total';
    totalEl.textContent = `Total: $${o.getTotal().toFixed(0)}`;

    card.appendChild(title);
    card.appendChild(badge);
    card.appendChild(itemList);
    card.appendChild(totalEl);

    if (showReceipt || o.getStatus() === OrderStatus.CALCULADA || o.getStatus() === OrderStatus.PAGADA) {
      card.appendChild(this.buildReceipt(o));
    }

    if (actionLabel && onAction) {
      const btn = document.createElement('button');
      btn.className = 'card-action-btn';
      btn.textContent = actionLabel;
      btn.addEventListener('click', () => onAction(o.getId()));
      card.appendChild(btn);
    }

    return card;
  }

  private buildReceipt(o: Order): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'boleta';

    const heading = document.createElement('div');
    heading.className = 'boleta-header';
    heading.textContent = o.getStatus() === OrderStatus.PAGADA ? '✅ BOLETA PAGADA' : '🧾 BOLETA';

    const table = document.createElement('table');
    table.className = 'boleta-table';

    for (const it of o.getItems()) {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      td1.textContent = it.getName();
      const td2 = document.createElement('td');
      td2.textContent = `$${it.getPrice().toFixed(0)}`;
      tr.appendChild(td1);
      tr.appendChild(td2);
      table.appendChild(tr);
    }

    const totalRow = document.createElement('tr');
    totalRow.className = 'boleta-total-row';
    const tdL = document.createElement('td');
    tdL.textContent = 'TOTAL';
    const tdV = document.createElement('td');
    tdV.textContent = `$${o.getTotal().toFixed(0)}`;
    totalRow.appendChild(tdL);
    totalRow.appendChild(tdV);
    table.appendChild(totalRow);

    wrap.appendChild(heading);
    wrap.appendChild(table);

    const paidAt = o.getPaidAt();
    if (paidAt) {
      const stamp = document.createElement('div');
      stamp.className = 'boleta-paid';
      stamp.textContent = `Pagado: ${paidAt.toLocaleString()}`;
      wrap.appendChild(stamp);
    }

    return wrap;
  }

  private colorForStatus(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.RECIBIDA:          return '#7c3aed';
      case OrderStatus.EN_COCINA:         return '#e65100';
      case OrderStatus.LISTA:             return '#20c997';
      case OrderStatus.ENTREGADA:         return '#1a1aff';
      case OrderStatus.CUENTA_SOLICITADA: return '#f59e0b';
      case OrderStatus.CALCULADA:         return '#0d7c4b';
      case OrderStatus.PAGADA:            return '#343a40';
      default:                            return '#000';
    }
  }
}
