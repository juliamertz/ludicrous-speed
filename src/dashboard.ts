import {
  Lightspeed,
  ORDER_STATUS_MAP,
  type OrderStatus,
} from "./api/lightspeed";
import { Adapter } from "./api/adapter";
import { createGridContainer } from "./utils/layout";
import { createOrderList } from "./components/order-list";
import { createStockTable } from "./components/stock-table";
import { injectStyles, preventDoubleRun, removeElements } from "./utils/dom";
import { dashboardCSS } from "./styles/dashboard-css";

function removeClassname(element: Element, className: string) {
  element.className = element.className
    .split(" ")
    .filter((value) => value !== className)
    .join(" ");
}

function cleanupDashboard(container: Element): void {
  console.log("cleaning up container", container)

  try {
    const advertisement = container.querySelector("div.dashboard-card-blog");
    const turnoverGraph = container.querySelector(
      "div#dashboard-turnover-graph",
    );
    const turnoverGraphContainer = turnoverGraph?.parentElement?.parentElement?.parentElement

    advertisement?.parentElement?.remove();
    if (turnoverGraphContainer) {
      removeClassname(turnoverGraphContainer, "W-8--m")
    }

  } catch (error) {
    console.error({
      extension: "ludicrous-speed",
      function: "cleanupDashboard",
      error,
    });
  }

  removeElements("#content > div:nth-child(2) > div.alert.wide.warning.top");
}

async function init(): Promise<void> {
  injectStyles(dashboardCSS);

  const containers = document.querySelectorAll(".container");
  const dashboardContainer = containers[2];

  if (!dashboardContainer) {
    return;
  }

  cleanupDashboard(dashboardContainer);

  if (preventDoubleRun(dashboardContainer)) {
    return;
  }

  const lightspeed = new Lightspeed();
  const adapter = new Adapter();

  const orderGrid = createGridContainer({ columns: 2 });
  dashboardContainer.appendChild(orderGrid);

  const stockGrid = createGridContainer({});
  stockGrid.style.marginTop = "12px";
  dashboardContainer.appendChild(stockGrid);

  const orderPromises = Object.entries(ORDER_STATUS_MAP).map(
    async ([status, displayName]) => {
      try {
        const orders = await lightspeed.listOrders(status as OrderStatus);
        const orderList = createOrderList({
          title: displayName,
          orders,
        });
        orderGrid.appendChild(orderList);
      } catch (error) {
        console.error({ extension: "ludicrous-speed", error });
      }
    },
  );

  try {
    const stockItems = await adapter.getStockUnderThreshold();
    const stockTable = createStockTable({ stockItems });
    stockGrid.appendChild(stockTable);
  } catch (error) {
    console.error({ extension: "ludicrous-speed", error });
  }

  await Promise.all(orderPromises);
}

(async () => {
  await init();
})();
