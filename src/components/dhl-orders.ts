/// <reference types="amcharts" />

import type { AmCharts as AmChartsTypes } from "amcharts";

declare global {
  const AmCharts: typeof AmChartsTypes & {
    ready(callback: () => void): void;
  };
}

import { MontlyProcessedMetric, OrderMetrics } from "../api/adapter";
import { createContainer } from "./container";

import { Br, Div, P, Span } from "../utils/element";

export function createMetricStatDisplay(metric: any, description?: string) {
  return Div(
    P()
      .children(
        Span(metric.toString()).style("fontSize", "2.5rem").class("mussel"),
        Br(),
        Br(),
        Span(description ?? "")
          .style("fontSize", "1.5rem")
          .style("marginTop", ".5rem")
          .class("mosesDark"),
      )
      .style("textAlign", "center"),
  )
    .style("background", "white")
    .style("width", "100%")
    .style("display", "grid")
    .style("placeItems", "center")
    .style("gap", "1.5rem")
    .style("padding", "2rem")
    .style("border", "solid 1px #c4cacc");
}

export function createOrderProcessingMetrics(metrics: OrderMetrics) {
  const metricDivs = [
    createMetricStatDisplay(metrics.processed, "Totaal verwerkte orders").style("borderRight", "none"),
    createMetricStatDisplay(metrics.unprocessed, "Totaal onverwerkte orders"),
    Div(),
  ];

  const container = Div().styles({ display: "flex", flexDirection: "column" });

  const statsContainer = Div()
    .styles({ display: "flex", flexDirection: "row" })
    .children(...metricDivs)
    .style("width", "100%")
    .style("padding", "0 6px")
    .style("marginTop", "1rem")
    .style("marginBottom", "1rem")
    .create();

  const chartContainer = createContainer({
    id: "orders-chart",
    title: "Verwerkte DHL orders",
  });
  chartContainer.style.margin = "7px"; // nice magic number...
  chartContainer.appendChild(createChart(metrics.chartData));

  return container.children(statsContainer, chartContainer).create();
}

function createChart(data: Array<MontlyProcessedMetric>) {
  function createContainer() {
    const chartId = "chart-" + Date.now();
    const container = Div().id(chartId).style("height", "350px").create();
    document.body.appendChild(container);
    return container;
  }

  const container = createContainer();
  let chart: AmChartsTypes.AmSerialChart;
  let graph: AmChartsTypes.AmGraph;

  chart = new AmCharts.AmSerialChart();

  chart.marginTop = 20;
  chart.marginRight = 20;
  chart.marginLeft = 10;
  chart.marginBottom = 33;
  chart.autoMarginOffset = 10;
  chart.autoMargins = true;

  chart.fontFamily = "LatoWeb, Helvetica Neue, Helvetica, Arial, sans-serif";
  chart.fontSize = '14';
  chart.color = "#494c4c";
  chart.pathToImages = "assets/amcharts/themes/seoshop/images/";

  chart.backgroundColor = "#ffffff";
  chart.backgroundAlpha = 0;
  chart.plotAreaBorderAlpha = 0;
  chart.plotAreaFillAlphas = 0;

  chart.dataProvider = data;
  chart.categoryField = "month";
  (chart as any).dataDateFormat = "YYYY-MM-DD";

  chart.thousandsSeparator = ",";
  chart.decimalSeparator = ".";
  chart.percentPrecision = 2;

  chart.balloon.cornerRadius = 6;
  chart.balloon.fillColor = "#FFFFFF";
  chart.balloonDateFormat = "MMM DD, YYYY";

  const categoryAxis = chart.categoryAxis;
  categoryAxis.parseDates = true;
  categoryAxis.minPeriod = "MM";
  categoryAxis.dashLength = 1;
  categoryAxis.gridAlpha = 0.4;
  categoryAxis.gridColor = "#E1E4E5";
  categoryAxis.axisColor = "#848A8A";
  categoryAxis.axisAlpha = 1;

  const valueAxis = new AmCharts.ValueAxis();
  valueAxis.axisAlpha = 0;
  valueAxis.gridAlpha = 0;
  valueAxis.labelsEnabled = true;
  valueAxis.dashLength = 1;
  valueAxis.inside = true;
  chart.addValueAxis(valueAxis);

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
  graph.valueField = "entries";
  graph.balloonText =
    "[[category]]<br><b><span style='font-size:14px;'>[[value]] entries</span></b>";
  graph.balloonColor = "#494c4c";
  chart.addGraph(graph);

  const chartCursor = new AmCharts.ChartCursor();
  chartCursor.pan = false;
  (chartCursor as any).valueLineEnabled = false;
  chartCursor.categoryBalloonEnabled = false;
  chartCursor.cursorAlpha = 0;
  chartCursor.cursorPosition = "mouse";
  chartCursor.categoryBalloonDateFormat = "MMM DD, YYYY";
  chartCursor.bulletSize = 2;
  chart.addChartCursor(chartCursor);

  chart.creditsPosition = "top-left";
  (chart as any).hideCredits = true;
  chart.sequencedAnimation = true;
  chart.startDuration = 0;
  chart.columnSpacing = 5;
  chart.columnWidth = 0.8;

  chart.write(container.id);
  return document.body.removeChild(container);
}
