# 🍝 PROMPT: Simulación de Flujo de Órdenes — Restaurante Thundercat

---

## 🎯 Contexto del Proyecto

Eres un desarrollador TypeScript experto. Debes construir una **simulación interactiva del flujo de una orden** en el restaurante **Thundercat** (fusión italiana-colombiana), usando **Listas** como estructura de datos central y **TypeScript orientado a objetos estricto**. El proyecto es un **snippet educativo con frontend**, NO un proyecto backend ni fullstack.

---

## 🏗️ ¿Qué debes construir?

Un conjunto de archivos TypeScript compilables + HTML + CSS que:

1. **Simulen el ciclo completo de una orden de restaurante** (desde que el cliente pide hasta que el plato es entregado), modelado con **listas enlazadas o arrays tipados como listas**.
2. **Reflejen el Diagrama de Procesos** de una orden típica de restaurante con estos estados en secuencia:

```
[Cliente llega] → [Mesero toma la orden] → [Orden enviada a cocina]
→ [Cocina prepara el plato] → [Plato listo] → [Mesero recoge]
→ [Plato entregado al cliente] → [Cliente paga] → [Orden cerrada]
```

3. **Expongan toda la lógica en el navegador** a través de una interfaz HTML+CSS minimalista que muestre el estado de la lista de órdenes en tiempo real (sin frameworks, solo DOM puro).

---

## 📁 Estructura de Archivos OBLIGATORIA

```
thundercat/
├── src/
│   ├── models/
│   │   ├── MenuItem.ts        # Modelo de ítem del menú
│   │   ├── Order.ts           # Modelo de una orden
│   │   └── OrderNode.ts       # Nodo de la lista enlazada
│   ├── structures/
│   │   └── OrderList.ts       # Lista enlazada de órdenes
│   ├── services/
│   │   └── OrderService.ts    # Lógica de negocio / flujo de estados
│   ├── ui/
│   │   └── UIRenderer.ts      # Renderizado DOM — solo manipula HTML
│   └── main.ts                # Entry point: instancia y conecta todo
├── index.html
├── styles.css
└── tsconfig.json
```

---

## 📐 Reglas de Arquitectura (OBLIGATORIO cumplir todas)

### ✅ SRP — Single Responsibility Principle
**Cada clase tiene UNA sola razón para existir y cambiar:**

| Clase | Responsabilidad única |
|---|---|
| `MenuItem` | Representar un ítem del menú con nombre, precio y categoría |
| `Order` | Representar una orden con sus ítems y estado actual |
| `OrderNode` | Ser un nodo de la lista enlazada (contiene Order + puntero next) |
| `OrderList` | Gestionar la estructura de lista: agregar, eliminar, recorrer nodos |
| `OrderService` | Orquestar el flujo de estados de una orden (avanzar estado) |
| `UIRenderer` | Leer el estado de la lista y pintar el DOM — ninguna lógica de negocio aquí |

### ✅ POO Estricto
- **Todas las propiedades deben ser `private`**
- **Acceso solo mediante `getters` y `setters` explícitos** (no usar propiedades públicas directas)
- **Constructores completos** que validen e inicialicen el estado
- Usa `readonly` donde corresponda (ej.: ID de orden)
- Usa `enum` para los estados de la orden

### ✅ Tipado estricto TypeScript
- **Sin `any`** en ningún lugar
- Usa tipos propios, interfaces y enums
- Activa en `tsconfig.json`: `"strict": true`

---

## 🔢 Estructura de Datos: Lista de Órdenes

La lista debe ser una **lista enlazada simple** implementada manualmente (no uses `Array<>` como lista, impleméntala con nodos):

```typescript
// Concepto base — debes implementarlo con clases y tipado estricto

OrderNode {
  private order: Order
  private next: OrderNode | null
}

OrderList {
  private head: OrderNode | null
  private size: number

  // Métodos obligatorios:
  enqueue(order: Order): void        // Agrega al final
  dequeue(): Order | null            // Elimina del frente
  advanceOrder(orderId: string): void // Avanza el estado de una orden específica
  toArray(): Order[]                 // Para que UIRenderer pueda iterar
  getSize(): number
}
```

---

## 🍽️ Datos del Restaurante Thundercat

- **Nombre:** Thundercat
- **Concepto:** Fusión italiana-colombiana
- **Menú de ejemplo (hardcodeado en `main.ts`):**

```
- Bandeja Carbonara (Pasta + Bandeja paisa fusión) — $32.000
- Risotto Costeño (Risotto + Mariscos del Pacífico) — $38.000
- Pizza Vallenata (Pizza + Hogao y chorizo) — $28.000
- Tiramisú de Arequipe — $14.000
- Limonada Siciliana — $8.000
```

- Crea al menos **3 órdenes simuladas** desde `main.ts` al cargar la página

---

## 🎨 Frontend — HTML y CSS

### HTML (`index.html`)
- Título: `🍝 Thundercat — Sistema de Órdenes`
- Un encabezado con el nombre del restaurante y subtítulo
- Un botón: **"➕ Nueva Orden"** (agrega una orden random al sistema)
- Un botón: **"⏩ Avanzar Primera Orden"** (llama a `dequeue` y avanza su estado)
- Un contenedor `#order-list` donde `UIRenderer` renderiza las tarjetas de órdenes
- Un pie de página simple: `"Thundercat © 2025 — Fusión Italiana Colombiana"`

### CSS (`styles.css`) — Estilo MINIMALISTA
**El CSS debe ser simple, limpio y funcional.** Nada de animaciones complejas ni diseño sofisticado. Guíate por estas reglas:

```
- Fuente: system-ui o sans-serif, tamaño base 16px
- Fondo de página: #f5f5f5
- Tarjetas de orden: fondo blanco, borde izquierdo de color según estado, padding 16px, border-radius 6px
- Colores de estado:
    RECIBIDA     → borde #f0ad4e (amarillo)
    EN_COCINA    → borde #5bc0de (azul)
    LISTA        → borde #5cb85c (verde)
    ENTREGADA    → borde #777    (gris)
    CERRADA      → borde #d9534f (rojo apagado)
- Botones: fondo oscuro (#333), texto blanco, sin bordes redondeados exagerados
- Sin gradientes, sin sombras pesadas, sin fuentes externas
```

---

## ⚙️ Configuración TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ES6",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "declaration": true
  },
  "include": ["src/**/*.ts"]
}
```

> ⚠️ Como es un snippet educativo sin bundler, los módulos TypeScript deben compilarse y referenciarse en `index.html` usando `<script type="module" src="./dist/main.js">`. El `outDir` debe respetar la misma estructura de carpetas de `src/`.

---

## ❌ LO QUE NO DEBES HACER

| ❌ Prohibido | ✅ Alternativa correcta |
|---|---|
| Usar `any` como tipo | Define interfaces o tipos propios |
| Propiedades públicas directas | Usa `private` + getter/setter |
| Poner lógica de negocio en `UIRenderer` | Solo lee datos, nunca los modifica |
| Usar frameworks (React, Vue, Angular) | Solo DOM vanilla |
| Usar `localStorage`, `fetch` o bases de datos | Todo en memoria, simulado |
| Clases que hagan más de una cosa | Divide en clases más pequeñas |
| CSS con librerías externas (Bootstrap, Tailwind) | Solo CSS puro en `styles.css` |
| Un solo archivo TypeScript monolítico | Respeta la estructura de archivos |
| Usar `Array<T>` como si fuera una lista enlazada | Implementa la lista con nodos reales |

---

## 📦 Entregables esperados

1. Todos los archivos `.ts` con el código completo y comentado
2. `index.html` funcional
3. `styles.css` minimalista
4. `tsconfig.json` listo para compilar con `tsc`
5. Instrucciones breves al final del prompt sobre cómo compilar y ejecutar:
   ```bash
   npm install -g typescript   # si no tienes tsc
   tsc                         # compila todos los archivos src/**/*.ts → dist/
   # Luego abre index.html en el navegador
   ```

---

## 🧠 Resumen de lo que debe demostrar el proyecto

- **Estructura de datos:** Lista enlazada como cola de órdenes
- **POO estricto:** Clases, constructores, getters, setters, enums
- **SRP aplicado:** Cada clase con una sola razón de cambio
- **TypeScript estricto:** Sin `any`, tipos bien definidos
- **Frontend mínimo:** HTML + CSS vanilla que visualice la lista en vivo
- **Contexto temático:** Restaurante Thundercat, fusión italiana-colombiana