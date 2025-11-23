import {
  Lightspeed,
  ORDER_STATUS_MAP,
  type OrderStatus,
} from "./api/lightspeed";
import { Adapter } from "./api/adapter";

import { dashboardCSS } from "./styles/dashboard-css";
import { createGridContainer } from "./utils/layout";
import {
  injectStyles,
  preventDoubleRun,
  removeElements,
  removeClassname,
} from "./utils/dom";

import { createOrderList } from "./components/order-list";
import { createStockTable } from "./components/stock-table";
import { createOrderProcessingChart } from "./components/dhl-orders";

function cleanupDashboard(container: Element): void {
  // advertisment card to the right of graph
  removeElements("div:has(> div.dashboard-card-blog)", container);

  // expand graph to fill up gap of advertisment
  const turnoverGraph = container.querySelector(
    "div.W-8--m:has(div#dashboard-turnover-graph)",
  );
  removeClassname("W-8--m", turnoverGraph);
}

async function init(): Promise<void> {
  injectStyles(dashboardCSS);

  const containers = document.querySelectorAll(".container");
  const dashboardContainer = containers[2];

  if (!dashboardContainer) {
    return;
  }

  cleanupDashboard(dashboardContainer);

  const changelogContainer = dashboardContainer.querySelector(
    `div.Flex.FlexWrap:has(a[href="/admin/changelog"])`,
  );
  if (changelogContainer) {
    changelogContainer.remove();
  }

  if (preventDoubleRun(dashboardContainer)) {
    return;
  }

  const lightspeed = new Lightspeed();
  const adapter = new Adapter();

  const orderGrid = createGridContainer({ columns: 2 });
  orderGrid.style.marginTop = "1rem";
  dashboardContainer.appendChild(orderGrid);

  const stockGrid = createGridContainer({});
  stockGrid.style.marginTop = "1rem";
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

  try {
    const chartData = await adapter.getMonthlyProcessedChart();
    const chart = createOrderProcessingChart(chartData);
    dashboardContainer.appendChild(chart);
  } catch (error) {
    console.error({
      extension: "ludicrous-speed",
      action: "insert-monthy-processed-chart",
      error,
    });
  }

  if (changelogContainer) {
    dashboardContainer.appendChild(changelogContainer);
  }
}

(async () => {
  await init();
})();
