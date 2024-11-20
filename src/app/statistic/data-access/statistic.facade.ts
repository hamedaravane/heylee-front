import { inject, Injectable } from '@angular/core';
import { BaseFacade } from '@shared/service/base.facade';
import { StatisticInfra } from '../infrastructure/statistic.infra';
import { firstValueFrom, Subject } from 'rxjs';
import { SaleReport } from '../entity/statistic.entity';

@Injectable({
  providedIn: 'root'
})
export class StatisticFacade extends BaseFacade {
  private readonly statisticInfra = inject(StatisticInfra);
  private readonly statisticsSubject = new Subject<SaleReport>();

  get statistics$() {
    return this.statisticsSubject.asObservable();
  }

  async loadStatistics() {
    await this.loadEntity(
      this.statisticsSubject,
      () => firstValueFrom(this.statisticInfra.fetchStatistics()),
      undefined
    );
  }
}
