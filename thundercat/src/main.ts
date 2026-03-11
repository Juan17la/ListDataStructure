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
const service   = new OrderService(orderList);
const ui        = new UIRenderer();

// Three sample orders at start
service.createOrder(uid(), [menu[0], menu[4]], 'Cliente A');
service.createOrder(uid(), [menu[2]],           'Cliente B');
service.createOrder(uid(), [menu[1], menu[3]], 'Cliente C');

// Items being built for the next new order
let tempItems: MenuItem[] = [];

function getAllOrders() {
  return [
    ...service.getPendingOrders(),
    ...service.getBillingOrders(),
    ...service.getPaidOrders(),
  ];
}

function refreshAll(): void {
  ui.render(getAllOrders(), {
    onRecoger:         (id) => { service.mozoRecogerPedido(id);    refreshAll(); },
    onElaborar:        (id) => { service.cocinaElaborarPedido(id); refreshAll(); },
    onServir:          (id) => { service.mozoServirPedido(id);     refreshAll(); },
    onSolicitarCuenta: (id) => { service.solicitarCuenta(id);      refreshAll(); },
    onCalcular:        (id) => { service.cajaCalcularTotal(id);    refreshAll(); },
    onPagar:           (id) => { service.clientePagar(id);         refreshAll(); },
  });
}

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
  const div     = document.getElementById('selected-items');
  const totalEl = document.getElementById('order-total');
  if (!div || !totalEl) return;
  div.innerHTML = '';
  let total = 0;
  for (const it of tempItems) {
    const row = document.createElement('div');
    row.className = 'selected-item';
    row.textContent = `${it.getName()} — $${it.getPrice().toFixed(0)}`;
    div.appendChild(row);
    total += it.getPrice();
  }
  totalEl.textContent = `$${total.toFixed(0)}`;
}

window.addEventListener('load', () => {
  updateMenuSelect();
  refreshAll();

  const addBtn     = document.getElementById('add-item');
  const sel        = document.getElementById('menu-select')  as HTMLSelectElement | null;
  const qty        = document.getElementById('menu-qty')     as HTMLInputElement   | null;
  const confirmBtn = document.getElementById('confirm-order');
  const resetBtn   = document.getElementById('reset-order');

  addBtn?.addEventListener('click', () => {
    if (!sel || !qty) return;
    const item = menu.find((m) => m.getName() === sel.value);
    if (!item) return;
    const q = Math.max(1, Number(qty.value) || 1);
    for (let i = 0; i < q; i++) tempItems.push(item);
    updateSelectedItemsView();
  });

  confirmBtn?.addEventListener('click', () => {
    const nameInput = document.getElementById('customer-name') as HTMLInputElement | null;
    if (!nameInput) return;
    if (tempItems.length === 0) {
      alert('Añade al menos un ítem a la orden.');
      return;
    }
    const customerName = nameInput.value.trim() || 'Cliente';
    const total = tempItems.reduce((s, it) => s + it.getPrice(), 0);
    const ok = confirm(`¿Confirmar orden para ${customerName}?\nTotal: $${total.toFixed(0)}`);
    if (!ok) return;
    service.createOrder(uid(), tempItems.slice(), customerName);
    tempItems = [];
    nameInput.value = '';
    updateSelectedItemsView();
    refreshAll();
  });

  resetBtn?.addEventListener('click', () => {
    tempItems = [];
    const nameInput = document.getElementById('customer-name') as HTMLInputElement | null;
    if (nameInput) nameInput.value = '';
    updateSelectedItemsView();
  });
});
