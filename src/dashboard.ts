const orderStatusMap = {
  "manco-bestelling-van-dijk": "Manco",
  "spoedbestelling-jvd": "Spoed",
  "besteld-bij-van-jvd-speciale-bestelling": "Speciale bestelling",
  "rechtstreeks-vanuit-fabriek-verzenden": "Fabriek verzenden"
}

type OrderStatus = keyof typeof orderStatusMap;

type CSS = Partial<CSSStyleDeclaration>;

type FilteredOrder = {
  order_number: string;
  customer_name: string;
  href: string;
  date: string;
}

class Lightspeed {
  endpoint: string = "https://nettenshop.webshopapp.com"

  async listOrders(status: string): Promise<Array<FilteredOrder>> {
    const url = `${this.endpoint}/admin/orders?custom_status=${status}`;
    const response = await fetch(url);

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const tableElement = doc.querySelector(
      "#table_orders > div > div > table > tbody"
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
      }
    })
  }
}

type StockVariant = {
  stockLevel: number;
  stockAlert: number;
};

type StockItem = {
  id: number;
  title: string;
  variants: Record<string, StockVariant>;
}

class Adapter {
  endpoint: string = "https://nettenshop.juliamertz.dev"

  async getStockUnderThreshold(): Promise<Array<StockItem>> {
    const response = await fetch(this.endpoint + "/stock-under-threshold");
    const data = await response.json()
    if (!Array.isArray(data)) throw new Error('invalid stock response from adapter')
    return data as Array<StockItem>
  }
}

function addStyles(styles: CSS, el: HTMLElement) {
  for (const key in styles) {
    el.style[key] = styles[key] as string;
  }
}

async function init() {
  const lightspeed = new Lightspeed()
  const adapter = new Adapter()

  const $ = (el: string) => document.querySelectorAll(el);

  const styles = `
    .item_styles {
      color: #494c4c;
      background: #fff;
      border: solid 1px #c4cacc;
      padding: 12px;
      border-radius: 3px;
      min-height: 12rem;
    }

    .item_wrapper_styles {
      display: grid;
      padding: 0 6px;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 12px;
    }

    .order_table_styles {
      display: table;
      width: 100%;
    }

    .order_table_styles > thead > tr > th {
      text-align: left;
    }

    .order_table_row_styles {
      display: flex;
      justify-content: space-between;
    }

    .span-2 {
      grid-column: span 2;
    }

    .subtitle_styles {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 6px;
      text-transform: capitalize;
    }

    .subtitle_styles > span {
      color: #848a8a;
      font-weight: normal;
    }

    @media (max-width: 768px) {
      .item_wrapper_styles {
        grid-template-columns: 1fr;
      }
      .span-2 {
        grid-column: span 1;
      }
    }

  `;

  // Inject styles into document head
  const stylesElement = document.createElement("style");
  stylesElement.innerHTML = styles;
  document.head.appendChild(stylesElement);

  const dashboard_items = $(".container")[1];

  if (!dashboard_items) {
    return;
  }

  // Prevent chrome extension from running this script twice on the same page load
  try {
    const has_already_run = dashboard_items.querySelector("has-run");
    if (has_already_run) {
      return;
    }
  } catch (e) { }

  const rerun_preventer = document.createElement("has-run");
  dashboard_items.appendChild(rerun_preventer);

  // Delete last two rows containing graph and advertisements
  try {
    if (dashboard_items.childNodes.length > 3) {
      const rowsToDelete = [
        dashboard_items.childNodes[3],
        dashboard_items.childNodes[5],
      ];

      for (const row of rowsToDelete) {
        row.remove();
      }
    }
  } catch (e) { }

  // Remove warning that pops up on every page load.
  const warning = $("#content > div:nth-child(2) > div.alert.wide.warning.top");
  if (warning.length > 0) {
    warning[0].remove();
  }
  // Create new item wrapper
  const item_wrapper = document.createElement("div");
  item_wrapper.classList.add("item_wrapper_styles");
  dashboard_items.appendChild(item_wrapper);

  const order_item_wrapper = document.createElement("div");
  order_item_wrapper.classList.add("item_wrapper_styles");
  order_item_wrapper.style.marginTop = "12px";
  dashboard_items.appendChild(order_item_wrapper);

  const items_to_add: HTMLDivElement[] = [];

  for await (const [status, displayName] of Object.entries(orderStatusMap)) {
    lightspeed.listOrders(status).then(async (orders) => {
      const item = document.createElement("div");
      item.classList.add("item_styles");

      const title = document.createElement("h3");
      title.classList.add("subtitle_styles");

      const order_amount = orders.length;

      title.innerHTML = displayName + ` <span>(${order_amount})</span>`;
      item.appendChild(title);

      const row_wrapper = document.createElement("div");
      row_wrapper.classList.add("order_table_styles");

      for (const order of orders) {
        const row = document.createElement("div");
        row.classList.add("order_table_row_styles");
        row.innerHTML = `
        <p>
          <a href="${order.href}">
            ${order.order_number}
          </a> - ${order.customer_name}
        </p>
        <p>${order.date}</p>
        `;
        row.classList.add("order_row");
        row_wrapper.appendChild(row);
      }

      item.appendChild(row_wrapper);

      if (!orders) return;

      item_wrapper.appendChild(item);
      items_to_add.push(item);
    });
  }

  const stock_item = document.createElement("div");
  stock_item.classList.add("item_styles");
  stock_item.classList.add("span-2");

  const stock_title = document.createElement("h3");
  stock_title.classList.add("subtitle_styles");
  stock_title.innerHTML = "Voorraad onder threshold";
  stock_item.appendChild(stock_title);

  const stock_item_table = document.createElement("table");
  stock_item_table.classList.add("order_table_styles");
  stock_item_table.innerHTML = `<thead>
    <tr>
      <th>Product</th>
      <th>Variant</th>
      <th>Voorraad</th>
    </thead>`;

  const stock_item_table_body = document.createElement("tbody");
  stock_item_table.appendChild(stock_item_table_body);
  stock_item.appendChild(stock_item_table);

  adapter.getStockUnderThreshold().then((stock) => {
    stock.forEach((item) => {
      const row = document.createElement("tr");
      const variant = Object.values(item.variants)[0]
      row.innerHTML = `
      <td>${item.title}</td>
      <td><a href="https://nettenshop.webshopapp.com/admin/products/${item.id}">${variant.id}</a></td>
      <td>${Object.values(item.variants)[0].stockLevel}</td>
      `;

      stock_item_table_body.appendChild(row);
    });

    order_item_wrapper.appendChild(stock_item);
  })
}

(async () => {
  await init();
})();
