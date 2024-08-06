import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }

    // Remove all non-numeric characters
    let cleanedValue = value.replace(/\D/g, '');

    // Define the country code and its format
    const countryCode = '+98 ';
    const countryCodeLength = 2; // Length of the country code without the +

    // Format the cleaned value
    if (cleanedValue.length <= countryCodeLength) {
      return countryCode + cleanedValue;
    }

    let formattedValue = countryCode;
    const mainNumber = value;

    if (mainNumber.length > 7) {
      formattedValue += mainNumber.slice(0, 3) + ' ' + mainNumber.slice(3, 6) + ' ' + mainNumber.slice(6);
    } else if (mainNumber.length > 3) {
      formattedValue += mainNumber.slice(0, 3) + ' ' + mainNumber.slice(3);
    } else {
      formattedValue += mainNumber;
    }

    return formattedValue;
  }
}
