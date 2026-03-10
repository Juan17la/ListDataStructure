import { MenuItem } from './models/MenuItem.js';
import { OrderList } from './structures/OrderList.js';
import { OrderService } from './services/OrderService.js';
import { UIRenderer } from './ui/UIRenderer.js';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Menu hardcoded (English code, Spanish labels in HTML)
const menu: MenuItem[] = [
  new MenuItem('Bandeja Carbonara', 32000, 'Main'),
  new MenuItem('Risotto Costeño', 38000, 'Main'),
  new MenuItem('Pizza Vallenata', 28000, 'Main'),
  new MenuItem('Tiramisú de Arequipe', 14000, 'Dessert'),
  new MenuItem('Limonada Siciliana', 8000, 'Drink')
];

const orderList = new OrderList();
const service = new OrderService(orderList);
const ui = new UIRenderer('pending-list', 'attended-list');

// Create 3 sample orders
service.createOrder(uid(), [menu[0], menu[4]], 'Cliente A');
service.createOrder(uid(), [menu[2]], 'Cliente B');
service.createOrder(uid(), [menu[1], menu[3]], 'Cliente C');

// State for building a new order before confirming
let tempItems: MenuItem[] = [];

function updateMenuSelect(): void {
  const sel = document.getElementById('menu-select') as HTMLSelectElement | null;
  if (!sel) return;
  sel.innerHTML = '';
  for (const m of menu) {
    const opt = document.createElement('option');
    opt.value = m.getName();
    opt.textContent = `${m.getName()} — $${m.getPrice().toFixed(0)}`;
    sel.appendChild(opt);
  }
}

function updateSelectedItemsView(): void {
  const div = document.getElementById('selected-items');
  const totalEl = document.getElementById('order-total');
  if (!div || !totalEl) return;
  div.innerHTML = '';
  let total = 0;
  for (const it of tempItems) {
    const p = document.createElement('div');
    p.textContent = `${it.getName()} — $${it.getPrice().toFixed(0)}`;
    div.appendChild(p);
    total += it.getPrice();
  }
  totalEl.textContent = `$${total.toFixed(0)}`;
}

window.addEventListener('load', () => {
  updateMenuSelect();

  const addBtn = document.getElementById('add-item');
  const sel = document.getElementById('menu-select') as HTMLSelectElement | null;
  const qty = document.getElementById('menu-qty') as HTMLInputElement | null;
  const confirmBtn = document.getElementById('confirm-order');
  const resetBtn = document.getElementById('reset-order');
  const advanceBtn = document.getElementById('btn-advance');

  const filterText = document.getElementById('filter-text') as HTMLInputElement | null;
  const filterStatus = document.getElementById('filter-status') as HTMLSelectElement | null;
  const attFrom = document.getElementById('att-from') as HTMLInputElement | null;
  const attTo = document.getElementById('att-to') as HTMLInputElement | null;
  const attFilterText = document.getElementById('att-filter-text') as HTMLInputElement | null;

  function refreshAll(): void {
    ui.renderPending(service.getPendingOrders(), filterText?.value ?? '',
      (filterStatus?.value as any) || undefined);
    const from = attFrom?.value ? new Date(attFrom.value) : undefined;
    const to = attTo?.value ? new Date(attTo.value) : undefined;
    ui.renderAttended(service.getAttendedOrders(), from, to, attFilterText?.value ?? '');
  }

  refreshAll();

  addBtn?.addEventListener('click', () => {
    if (!sel || !qty) return;
    const name = sel.value;
    const q = Math.max(1, Number(qty.value) || 1);
    const item = menu.find((m) => m.getName() === name);
    if (!item) return;
    for (let i = 0; i < q; i++) tempItems.push(item);
    updateSelectedItemsView();
  });

  confirmBtn?.addEventListener('click', () => {
    const customerInput = document.getElementById('customer-name') as HTMLInputElement | null;
    if (!customerInput) return;
    if (tempItems.length === 0) {
      alert('Add at least one item to the order');
      return;
    }
    const total = tempItems.reduce((s, it) => s + it.getPrice(), 0);
    const ok = confirm(`Confirm order for ${customerInput.value || 'Cliente'} — Total: $${total.toFixed(0)}?`);
    if (!ok) return;
    service.createOrder(uid(), tempItems.slice(), customerInput.value || 'Cliente');
    tempItems = [];
    (document.getElementById('customer-name') as HTMLInputElement).value = '';
    updateSelectedItemsView();
    refreshAll();
  });

  resetBtn?.addEventListener('click', () => {
    tempItems = [];
    (document.getElementById('customer-name') as HTMLInputElement).value = '';
    updateSelectedItemsView();
  });

  advanceBtn?.addEventListener('click', () => {
    service.advanceFirstOrderToAttended();
    refreshAll();
  });

  filterText?.addEventListener('input', () => refreshAll());
  filterStatus?.addEventListener('change', () => refreshAll());
  attFrom?.addEventListener('change', () => refreshAll());
  attTo?.addEventListener('change', () => refreshAll());
  attFilterText?.addEventListener('input', () => refreshAll());
});
