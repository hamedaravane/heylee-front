export interface DailySaleDto {
  sale_date: string;
  total_daily_sales?: string;
  total_daily_profit?: string;
  day_of_week: string;
}

export interface TopSellingProductDto {
  product_id: number;
  name: string;
  code: string;
  total_sold: string;
}

export interface SaleReportDto {
  daily_sales: DailySaleDto[];
  total_profit: string;
  top_selling_products: TopSellingProductDto[];
  average_order_value: string;
  profit_after_expenses: string;
  total_investments: string;
  total_expenses: string;
  total_revenue: string;
  total_number_of_items_sold: string;
  total_number_of_orders: number;
  expected_bank_balance: number;
}

export interface DailySale {
  saleDate: string;
  totalDailySales?: string;
  totalDailyProfit?: string;
  dayOfWeek: string;
}

export interface TopSellingProduct {
  productId: number;
  name: string;
  code: string;
  totalSold: string;
}

export interface SaleReport {
  dailySales: DailySale[];
  totalProfit: string;
  topSellingProducts: TopSellingProduct[];
  averageOrderValue: string;
  profitAfterExpenses: string;
  totalInvestments: string;
  totalExpenses: string;
  totalRevenue: string;
  totalNumberOfItemsSold: string;
  totalNumberOfOrders: number;
  expectedBankBalance: number;
}
