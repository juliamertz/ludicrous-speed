import type { FilteredOrder } from "../api/lightspeed";
import { createContainer } from "./container";
import { Div, P, A, Span } from "../utils/element";

export interface OrderListOptions {
  title: string;
  orders: FilteredOrder[];
}

export function createOrderList(options: OrderListOptions): HTMLElement {
  const container = createContainer({
    title: options.title,
    titleCount: options.orders.length,
  });

  const rows = options.orders.map((order) => {
    return Div()
      .class("order-table-row")
      .children(
        P().children(
          A(order.order_number, order.href),
          Span(` - ${order.customer_name}`)
        ),
        P(order.date)
      );
  });

  const scrollWrapper = Div()
    .class("order-table-scroll")
    .children(
      Div()
        .class("order-table")
        .children(...rows)
    );

  container.appendChild(scrollWrapper.create());
  return container;
}
