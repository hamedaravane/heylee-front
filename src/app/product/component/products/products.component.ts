import {Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {AsyncPipe, DecimalPipe, NgOptimizedImage, NgTemplateOutlet} from '@angular/common';
import {BidiModule} from '@angular/cdk/bidi';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductFacade} from '../../data-access/product.facade';
import {Product} from '../../entity/product.entity';
import {NzUploadModule} from 'ng-zorro-antd/upload';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';
import {
  ProductImageContainerComponent
} from '@shared/component/product-image-container/product-image-container.component';

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
    NzPaginationModule,
    RouterLink,
    ReactiveFormsModule,
    NgOptimizedImage,
    DecimalPipe,
    PageContainerComponent,
    CardContainerComponent,
    NgTemplateOutlet,
    ProductImageContainerComponent
  ]
})
export class ProductsComponent implements OnInit {
  private readonly productFacade = inject(ProductFacade);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('imageSelector') imageSelector!: ElementRef<HTMLInputElement>;
  productsIndex$ = this.productFacade.productsIndex$;
  isAddProductVisible = false;
  isEditProductVisible = false;
  selectedIdToEdit: number | null = null;
  loadingState = false;
  selectedImage?: string;
  imageFile: File | null = null;

  productForm = new FormGroup({
    code: new FormControl<string>('', Validators.required),
    name: new FormControl<string>('', Validators.required),
    description: new FormControl<string | null>(null),
  })

  ngOnInit() {
    this.productFacade.loadProducts().then();
    this.productFacade.loading$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this.loadingState = loading)
  }

  pageIndexChange(pageIndex: number): void {
    this.productFacade.loadProducts(pageIndex).then();
  }

  selectProductId(id: number, product: { name: string, code: string, description: string}) {
    this.selectedIdToEdit = id;
    this.productForm.setValue({
      name: product.name,
      code: product.code,
      description: product.description
    })
    this.isEditProductVisible = true;
  }

  editProduct() {
    const formData = this.generateForm();
    if (this.selectedIdToEdit) {
      this.productFacade.editProduct(this.selectedIdToEdit, formData).then(() => {
        this.closeProductFormDrawer();
        this.productForm.reset();
      });
    }
  }

  createProduct() {
    const formData = this.generateForm();
    this.productFacade.createProduct(formData).then(() => {
      this.closeProductFormDrawer();
      this.productForm.reset();
    });
  }

  generateForm(): FormData {
    const form = this.productForm.getRawValue() as Product;
    const formData = new FormData();

    formData.append('code', form.code);
    formData.append('name', form.name);
    formData.append('description', form.description);
    if (this.imageFile) {
      formData.append('image', this.imageFile, this.imageFile.name);
    }
    return formData;
  }

  deleteProduct(id: number) {
    this.productFacade.deleteProduct(id).then(() => {
      this.closeProductFormDrawer();
      this.productForm.reset();
    });
  }

  closeProductFormDrawer() {
    this.isAddProductVisible = false;
    this.isEditProductVisible = false;
    this.selectedImage = undefined;
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
