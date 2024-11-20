import { Pipe, PipeTransform } from '@angular/core';
import { colors } from '@colors';

@Pipe({
  name: 'shippingStatus',
  standalone: true
})
export class ShippingStatusPipe implements PipeTransform {
  transform(value: string) {
    switch (value) {
      case 'ready-to-ship':
        return { label: 'آماده‌ی ارسال', color: colors.orange_5 };
      case 'shipped':
        return { label: 'ارسال شده', color: colors.emerald_5 };
      case 'on-hold':
        return { label: 'رزرو', color: colors.blue_5 };
      default:
        return { label: 'لغو شده', color: colors.rose_5 };
    }
  }
}
