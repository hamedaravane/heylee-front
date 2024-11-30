import { lastValueFrom, Observable, switchMap } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageConversionService {
  constructor(private http: HttpClient) {
  }

  /**
   * Converts an image URL to a Base64-encoded string.
   * @param url The URL of the image to convert.
   * @returns A Promise that resolves to the Base64 string.
   */
  getBase64ImageFromURL(url: string): Promise<string> {
    return lastValueFrom(this.http
      .get(url, { responseType: 'blob' })
      .pipe(switchMap((blob) => this.convertBlobToBase64(blob))));
  }

  /**
   * Converts a Blob object to a Base64-encoded string.
   * @param blob The Blob to convert.
   * @returns An Observable that emits the Base64 string.
   */
  private convertBlobToBase64(blob: Blob): Observable<string> {
    return new Observable<string>((observer) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        observer.next(reader.result as string);
        observer.complete();
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
      reader.readAsDataURL(blob);
    });
  }
}
