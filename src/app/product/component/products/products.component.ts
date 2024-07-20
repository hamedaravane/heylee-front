import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { BidiModule } from '@angular/cdk/bidi';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductFacade } from '../../data-access/product.facade';
import { Product } from '../../entity/product.entity';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PageContainerComponent } from '@shared/component/page-container/page-container.component';
import { CardContainerComponent } from '@shared/component/card-container/card-container.component';

@Component({
  standalone: true,
  selector: 'products',
  templateUrl: './products.component.html',
  imports: [
    AsyncPipe,
    BidiModule,
    NzDrawerModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzUploadModule,
    NzDividerModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzButtonModule,
    RouterLink,
    ReactiveFormsModule,
    NgOptimizedImage,
    DecimalPipe,
    PageContainerComponent,
    CardContainerComponent
  ]
})
export class ProductsComponent implements OnInit {
  private readonly productFacade = inject(ProductFacade);
  private readonly nzMessageService = inject(NzMessageService);
  productsIndex$ = this.productFacade.productsIndex$;
  isAddProductVisible = false;
  loading = false;
  imageUrl?: string;

  createProductForm = new FormGroup({
    code: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  })

  ngOnInit() {
    this.productFacade.loadProducts().then();
  }

  editProduct(id: number, product: Product) {
    this.productFacade.editProduct(id, product).then();
  }

  createProduct() {
  }

  deleteProduct(id: number) {
    this.productFacade.deleteProduct(id).then();
  }

  closeAddProduct() {
    this.isAddProductVisible = false;
  }

  beforeUpload = (file: NzUploadFile, _fileList: NzUploadFile[]): Observable<boolean> =>
    new Observable((observer: Observer<boolean>) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        this.nzMessageService.error('You can only upload JPG file!');
        observer.complete();
        return;
      }
      const isLt2M = file.size! / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.nzMessageService.error('Image must smaller than 2MB!');
        observer.complete();
        return;
      }
      observer.next(isJpgOrPng && isLt2M);
      observer.complete();
    });

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  handleChange(info: { file: NzUploadFile }): void {
    switch (info.file.status) {
      case 'uploading':
        this.loading = true;
        break;
      case 'done':
        // Get this url from response in real world.
        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.loading = false;
          this.imageUrl = img;
        });
        break;
      case 'error':
        this.nzMessageService.error('Network error');
        this.loading = false;
        break;
    }
  }
}
