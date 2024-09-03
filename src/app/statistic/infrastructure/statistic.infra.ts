import {Injectable} from "@angular/core";
import {BaseInfra} from "@shared/service/base.infra";
import {environment} from "@environment";
import {ServerResponse} from "@shared/entity/server-response.entity";
import {SaleReport, SaleReportDto} from "../entity/statistic.entity";
import {map} from "rxjs";
import {toCamelCase} from "@shared/entity/utility.entity";

@Injectable({
  providedIn: 'root'
})
export class StatisticInfra extends BaseInfra {

  fetchStatistics() {
    return this.http.get<ServerResponse<SaleReportDto>>(`${environment.apiUrl}/statistic/all`).pipe(
      map((response) => {
        if (response.ok) {
          return toCamelCase<SaleReportDto, SaleReport>(response.result)
        } else {
          throw response.result as unknown;
        }
      })
    )
  }
}
