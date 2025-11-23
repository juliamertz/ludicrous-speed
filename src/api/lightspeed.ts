export type OrderStatus =
  | "manco-bestelling-van-dijk"
  | "spoedbestelling-jvd"
  | "besteld-bij-van-jvd-speciale-bestelling"
  | "rechtstreeks-vanuit-fabriek-verzenden";

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  "manco-bestelling-van-dijk": "Manco",
  "spoedbestelling-jvd": "Spoed",
  "besteld-bij-van-jvd-speciale-bestelling": "Speciale bestelling",
  "rechtstreeks-vanuit-fabriek-verzenden": "Fabriek verzenden",
};

export interface FilteredOrder {
  order_number: string;
  customer_name: string;
  href: string;
  date: string;
}

export class Lightspeed {
  private endpoint: string = "https://nettenshop.webshopapp.com";

  async listOrders(status: OrderStatus): Promise<Array<FilteredOrder>> {
    const url = `${this.endpoint}/admin/orders?custom_status=${status}`;
    const response = await fetch(url);

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const tableElement = doc.querySelector(
      "#table_orders > div > div > table > tbody",
    );

    return Array.from(tableElement?.children ?? []).map((row) => {
      const order_number_element = row.children[1].children[0].children[0];
      const order_number = order_number_element.innerHTML.trim();
      const href = order_number_element.getAttribute("href") || "#";
      const name = row.children[2].children[0].children[0].innerHTML.trim();
      const stringDate = row.children[4].children[0].innerHTML
        .trim()
        .split(" om ")[0];

      return {
        order_number,
        customer_name: name,
        href,
        date: stringDate,
      };
    });
  }
}
