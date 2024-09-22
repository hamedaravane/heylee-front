import {inject, Injectable} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {BehaviorSubject, Subject} from 'rxjs';
import {ServerResponseError} from '@shared/entity/server-response.entity';

@Injectable({
  providedIn: 'root'
})
export class BaseFacade {
  protected readonly nzMessageService = inject(NzMessageService);
  protected readonly loadingSubject = new BehaviorSubject<boolean>(false);

  get loading$() {
    return this.loadingSubject.asObservable();
  }

  protected async loadEntity<TDomain>(
    entitySubject: Subject<TDomain>,
    infraFn: () => Promise<TDomain>,
    reloadFn?: () => Promise<void>,
    silent: boolean = false
  ) {
    this.loadingSubject.next(true);
    try {
      const response = await infraFn();
      entitySubject.next(response);
      if (!silent) {
        this.nzMessageService.success('The entity reloaded successfully');
      }
      if (reloadFn) {
        await reloadFn();
      }
    } catch (err) {
      this.handleErrors(err);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  protected async deleteEntity(
    infraFn: () => Promise<void>,
    reloadFn: () => Promise<void>
  ) {
    this.loadingSubject.next(true);
    try {
      await infraFn();
      this.nzMessageService.success('The entity deleted successfully');
      await reloadFn();
    } catch (err) {
      this.handleErrors(err);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private handleErrors(err: unknown) {
    const error = new ServerResponseError(err);
    if (error.status !== 422) {
      console.error(error.res);
      this.nzMessageService.error(error.res.message);
    } else {
      console.error(error.validationErrors);
      throw error.validationErrors;
    }
  }
}
