export type StockVariant = {
  stockLevel: number;
  stockAlert: number;
  id?: string;
};

export type StockItem = {
  id: number;
  title: string;
  variants: Record<string, StockVariant>;
};

export type MontlyProcessedMetric = {
  month: string;
  entries: number;
};

export type OrderMetrics = {
  processed: number;
  unprocessed: number;
  chartData: Array<MontlyProcessedMetric>;
};

export class Adapter {
  private endpoint: string = "https://nettenshop.juliamertz.dev";

  async getStockUnderThreshold(): Promise<Array<StockItem>> {
    const response = await fetch(this.endpoint + "/stock-under-threshold");
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("invalid stock response from adapter");
    }

    return data as Array<StockItem>;
  }

  async getMonthlyProcessedChart(): Promise<OrderMetrics> {
    const response = await fetch(this.endpoint + "/order-processing-chart");
    const data = await response.json();
    return data as OrderMetrics;
  }
}
