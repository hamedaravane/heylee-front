import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  standalone: true,
  name: 'persianDate'
})
export class PersianDatePipe implements PipeTransform {
  transform(value: string): string {
    const date = new Date(value);
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'Asia/Tehran',
      hour12: false
    });
    return formatter.format(date);
  }
}
