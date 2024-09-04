import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {StatisticFacade} from "../data-access/statistic.facade";
import {PageContainerComponent} from "@shared/component/page-container/page-container.component";
import {CardContainerComponent} from "@shared/component/card-container/card-container.component";
import {NzStatisticModule} from "ng-zorro-antd/statistic";
import {AsyncPipe, DecimalPipe} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DailySale, TopSellingProduct} from "../entity/statistic.entity";
import {CurrencyComponent} from "@shared/component/currency-wrapper/currency.component";
import {Chart, ChartData, ChartOptions} from "chart.js";
import {BaseChartDirective} from "ng2-charts";
import {colors} from "@colors";

interface Report {
  id: string;
  title: string;
  value: null | number | string;
  currency: boolean;
  icon: string;
}

Chart.defaults.font.family = 'Vazirmatn';

@Component({
  standalone: true,
  selector: 'statistic',
  templateUrl: './statistic.component.html',
  imports: [
    PageContainerComponent,
    CardContainerComponent,
    NzStatisticModule,
    AsyncPipe,
    DecimalPipe,
    BaseChartDirective,
    CurrencyComponent
  ]
})
export class StatisticComponent implements OnInit {
  reports: Report[] = [
    {id: 'totalProfit', title: 'سود کل', value: null, currency: true, icon: 'fa-dollar-sign'},
    {id: 'averageOrderValue', title: 'میانگین ارزش خرید', value: null, currency: true, icon: 'fa-chart-line'},
    {id: 'profitAfterExpenses', title: 'سود خالص', value: null, currency: true, icon: 'fa-chart-area'},
    {id: 'totalInvestments', title: 'کل سرمایه‌گذاری‌ها', value: null, currency: true, icon: 'fa-money-bill-wave'},
    {id: 'totalExpenses', title: 'کل هزینه‌ها', value: null, currency: true, icon: 'fa-money-bill-wave'},
    {id: 'totalRevenue', title: 'کل درآمد', value: null, currency: true, icon: 'fa-money-bill-wave'},
    {id: 'totalNumberOfItemsSold', title: 'تعداد کل فروش', value: null, currency: false, icon: 'fa-box'},
    {id: 'totalNumberOfOrders', title: 'تعداد کل سفارش‌ها', value: null, currency: false, icon: 'fa-boxes'},
    {id: 'expectedBankBalance', title: 'موجودی پیش‌بینی شده', value: null, currency: true, icon: 'fa-money-bill-wave'},
  ];
  dailySalesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  dailySalesChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'تاریخ فروش',
        }
      },
      y: {
        title: {
          display: true,
          text: 'مقدار کل فروش',
        },
        beginAtZero: true
      }
    }
  };
  topSellingProductChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  topSellingProductChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'نام محصول',
        }
      },
      y: {
        title: {
          display: true,
          text: 'تعداد کل فروش',
        },
        beginAtZero: true
      }
    }
  };
  private readonly statisticFacade = inject(StatisticFacade);
  loading$ = this.statisticFacade.loading$;
  private readonly destroyRef = inject(DestroyRef);
  private readonly formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn');

  ngOnInit() {
    this.statisticFacade.loadStatistics().then();
    this.statisticFacade.statistics$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((statistics) => {
        this.reports.map(report => {
          Object.entries(statistics).map(([key, value]) => {
            if (report.id === key) {
              report.value = value
            }
          })
        })
        this.initializeDailySalesChart(statistics.dailySales);
        this.initializeTopSellingProductChart(statistics.topSellingProducts)
      });
  }

  initializeDailySalesChart(dailySales: DailySale[]): void {
    const labels = dailySales.map(sale => {
      const saleJsDate = new Date(sale.saleDate);
      return this.formatter.format(saleJsDate);
    });
    const totalDailySales: number[] = dailySales.map(sale => parseInt(sale.totalDailySales || '0', 10));
    const totalDailyProfit: number[] = dailySales.map(sale => parseInt(sale.totalDailyProfit || '0', 10));

    this.dailySalesChartData = {
      labels,
      datasets: [
        {
          label: 'مجموع فروش روزانه',
          data: totalDailySales,
          backgroundColor: colors.emerald_7,
          borderColor: colors.emerald_5,
          borderWidth: 1
        },
        {
          label: 'مجموع سود روزانه',
          data: totalDailyProfit,
          backgroundColor: colors.green_7,
          borderColor: colors.green_5,
          borderWidth: 1
        }
      ]
    };
  }

  initializeTopSellingProductChart(topSellingProduct: TopSellingProduct[]): void {
    const labels: string[] = topSellingProduct.map(product => product.name);
    const totalSold: number[] = topSellingProduct.map(product => parseInt(product.totalSold, 10));

    this.topSellingProductChartData = {
      labels,
      datasets: [
        {
          label: 'مجموع فروش',
          data: totalSold,
          backgroundColor: colors.cyan_8,
          borderColor: colors.cyan_5,
          borderWidth: 1
        }
      ]
    };
  }
}
