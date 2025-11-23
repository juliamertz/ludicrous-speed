import type { StockItem } from "../api/adapter";
import { createContainer } from "./container";

export interface StockTableOptions {
  stockItems: StockItem[];
}

export function createStockTable(options: StockTableOptions): HTMLElement {
  const container = createContainer({
    title: "Voorraad onder threshold",
    spanColumns: 2,
  });

  container.style.marginBottom = "3.5rem";
  const scrollWrapper = document.createElement("div");
  scrollWrapper.classList.add("order-table-scroll");

  const table = document.createElement("table");
  table.classList.add("stock-table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Product</th>
        <th>Variant</th>
        <th>Voorraad</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement("tbody");

  options.stockItems.forEach((item) => {
    const row = document.createElement("tr");
    const variant = Object.values(item.variants)[0];
    row.innerHTML = `
      <td>${item.title}</td>
      <td><a href="https://nettenshop.webshopapp.com/admin/products/${item.id}">${variant.id || "N/A"}</a></td>
      <td>${variant.stockLevel}</td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  scrollWrapper.appendChild(table);
  container.appendChild(scrollWrapper);
  return container;
}
