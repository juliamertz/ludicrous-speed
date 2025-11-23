import type { FilteredOrder } from "../api/lightspeed";
import { createContainer } from "./container";

export interface OrderListOptions {
  title: string;
  orders: FilteredOrder[];
}

export function createOrderList(options: OrderListOptions): HTMLElement {
  const container = createContainer({
    title: options.title,
    titleCount: options.orders.length,
  });

  const scrollWrapper = document.createElement("div");
  scrollWrapper.classList.add("order-table-scroll");

  const table = document.createElement("div");
  table.classList.add("order-table");

  options.orders.forEach((order) => {
    const row = document.createElement("div");
    row.classList.add("order-table-row");
    row.innerHTML = `
      <p>
        <a href="${order.href}">
          ${order.order_number}
        </a> - ${order.customer_name}
      </p>
      <p>${order.date}</p>
    `;
    table.appendChild(row);
  });

  scrollWrapper.appendChild(table);
  container.appendChild(scrollWrapper);
  return container;
}
