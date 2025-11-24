import type { StockItem } from "../api/adapter";
import { createContainer } from "./container";
import { Div, Table, Thead, Tbody, Tr, Th, Td, A } from "../utils/element";

export interface StockTableOptions {
  stockItems: StockItem[];
}

export function createStockTable(options: StockTableOptions): HTMLElement {
  const container = createContainer({
    title: "Voorraad onder threshold",
    spanColumns: 2,
  });

  container.style.marginBottom = "1rem";
  
  const rows = options.stockItems.map((item) => {
    const variant = Object.values(item.variants)[0];
    return Tr().children(
      Td(item.title),
      Td().children(
        A(variant.id || "N/A", `https://nettenshop.webshopapp.com/admin/products/${item.id}`)
      ),
      Td(String(variant.stockLevel))
    );
  });

  const scrollWrapper = Div()
    .class("order-table-scroll")
    .children(
      Table()
        .class("stock-table")
        .children(
          Thead().children(
            Tr().children(
              Th("Product"),
              Th("Variant"),
              Th("Voorraad")
            )
          ),
          Tbody().children(...rows)
        )
    );

  container.appendChild(scrollWrapper.create());
  return container;
}
