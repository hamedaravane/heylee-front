import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {StatisticFacade} from "../data-access/statistic.facade";
import {PageContainerComponent} from "@shared/component/page-container/page-container.component";
import {CardContainerComponent} from "@shared/component/card-container/card-container.component";
import {NzStatisticModule} from "ng-zorro-antd/statistic";
import {AsyncPipe, DecimalPipe} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SaleReport} from "../entity/statistic.entity";
import {CurrencyComponent} from "@shared/component/currency-wrapper/currency.component";

interface Report {
  id: string;
  title: string;
  value: null | number | string;
  currency: boolean;
  icon: string;
}

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
    CurrencyComponent
  ]
})
export class StatisticComponent implements OnInit {
  statistics: SaleReport | null = null;
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
  private readonly statisticFacade = inject(StatisticFacade);
  loading$ = this.statisticFacade.loading$;
  private readonly destroyRef = inject(DestroyRef);

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
        this.statistics = statistics
      });
  }
}
