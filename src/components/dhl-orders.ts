/// <reference types="amcharts" />

import type { AmCharts as AmChartsTypes } from "amcharts";

declare global {
  const AmCharts: typeof AmChartsTypes & {
    ready(callback: () => void): void;
  };
}

import { MontlyProcessedMetric } from "../api/adapter";
import { createContainer } from "./container";

import { Div } from "../utils/element";

export function createOrderProcessingChart(data: Array<MontlyProcessedMetric>) {
  const container = createContainer({
    id: "orders-chart",
    title: "Verwerkte DHL orders",
  });
  container.style.margin = "7px"; // nice magic number...
  container.appendChild(createChart(data));

  return container;
}

function createChartContainer() {
  const chartId = "chart-" + Date.now();
  const container = Div().id(chartId).style("height", "350px").create();
  document.body.appendChild(container);
  return container;
}

function createChart(data: Array<MontlyProcessedMetric>) {
  const container = createChartContainer();
  let chart: AmChartsTypes.AmSerialChart;
  let graph: AmChartsTypes.AmGraph;

  chart = new AmCharts.AmSerialChart();

  // Margins - match exact values
  chart.marginTop = 20;
  chart.marginRight = 20;
  chart.marginLeft = 10;
  chart.marginBottom = 33;
  chart.autoMarginOffset = 10;
  chart.autoMargins = true;

  // Theme and styling
  chart.fontFamily = "LatoWeb, Helvetica Neue, Helvetica, Arial, sans-serif";
  chart.fontSize = 14;
  chart.color = "#494c4c";
  chart.pathToImages = "assets/amcharts/themes/seoshop/images/";

  // Background
  chart.backgroundColor = "#ffffff";
  chart.backgroundAlpha = 0;
  chart.plotAreaBorderAlpha = 0;
  chart.plotAreaFillAlphas = 0;

  // Data configuration
  chart.dataProvider = data;
  chart.categoryField = "month"; // ← CHANGED BACK
  chart.dataDateFormat = "YYYY-MM-DD";

  // Number formatting
  chart.thousandsSeparator = ",";
  chart.decimalSeparator = ".";
  chart.percentPrecision = 2;

  // Balloon configuration
  chart.balloon.cornerRadius = 6;
  chart.balloon.fillColor = "#FFFFFF";
  chart.balloonDateFormat = "MMM DD, YYYY";

  // Category axis
  const categoryAxis = chart.categoryAxis;
  categoryAxis.parseDates = true;
  categoryAxis.minPeriod = "MM";
  categoryAxis.dashLength = 1;
  categoryAxis.gridAlpha = 0.4;
  categoryAxis.gridColor = "#E1E4E5";
  categoryAxis.axisColor = "#848A8A";
  categoryAxis.axisAlpha = 1;

  // Value axis
  const valueAxis = new AmCharts.ValueAxis();
  valueAxis.axisAlpha = 0;
  valueAxis.gridAlpha = 0;
  valueAxis.labelsEnabled = true;
  valueAxis.dashLength = 1;
  valueAxis.inside = true;
  chart.addValueAxis(valueAxis);

  // Graph
  graph = new AmCharts.AmGraph();
  graph.lineColor = "#2775C6";
  graph.bullet = "round";
  graph.bulletSize = 6;
  graph.bulletBorderColor = "#FFFFFF";
  graph.bulletBorderThickness = 2;
  graph.bulletBorderAlpha = 1;
  graph.bulletColor = "#ffffff";
  graph.connect = false;
  graph.lineThickness = 2;
  graph.lineAlpha = 1;
  graph.fillAlphas = 0;
  graph.useLineColorForBulletBorder = true;
  graph.valueField = "entries"; // ← CHANGED BACK
  graph.balloonText =
    "[[category]]<br><b><span style='font-size:14px;'>[[value]] entries</span></b>";
  graph.balloonColor = "#494c4c";
  chart.addGraph(graph);

  // Chart cursor
  const chartCursor = new AmCharts.ChartCursor();
  chartCursor.pan = false;
  chartCursor.valueLineEnabled = false;
  chartCursor.categoryBalloonEnabled = false;
  chartCursor.cursorAlpha = 0;
  chartCursor.cursorPosition = "mouse";
  chartCursor.categoryBalloonDateFormat = "MMM DD, YYYY";
  chartCursor.bulletSize = 2;
  chart.addChartCursor(chartCursor);

  // Other settings
  chart.creditsPosition = "top-left";
  chart.hideCredits = true;
  chart.sequencedAnimation = true;
  chart.startDuration = 0;
  chart.columnSpacing = 5;
  chart.columnWidth = 0.8;

  chart.write(container.id);
  return document.body.removeChild(container);
}
