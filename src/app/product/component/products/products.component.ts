import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
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
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
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
  @ViewChild('imageSelector') imageSelector!: ElementRef<HTMLInputElement>;
  productsIndex$ = this.productFacade.productsIndex$;
  isAddProductVisible = false;
  loading = false;
  selectedImage?: string;
  imageFile: File | null = null;

  createProductForm = new FormGroup({
    code: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl<string | null>(null),
  })

  ngOnInit() {
    this.productFacade.loadProducts().then();
  }

  editProduct(id: number, product: Product) {
    this.productFacade.editProduct(id, product).then();
  }

  createProduct() {
    const form = this.createProductForm.getRawValue() as Product;
    const formData = new FormData();

    formData.append('code', form.code);
    formData.append('name', form.name);
    formData.append('description', form.description);
    if (this.imageFile) {
      const blob = new Blob([this.imageFile], { type: this.imageFile?.type });
      formData.append('image', blob);
    }
    this.productFacade.createProduct(formData).then(() => this.productFacade.loadProducts());
  }

  deleteProduct(id: number) {
    this.productFacade.deleteProduct(id).then(() => this.productFacade.loadProducts());
  }

  closeAddProduct() {
    this.isAddProductVisible = false;
  }

  selectImage() {
    this.imageSelector.nativeElement.click();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImage = e.target?.result as string;
      }
      reader.readAsDataURL(this.imageFile);
    }
  }
}
