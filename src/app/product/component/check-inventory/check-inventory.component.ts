import { Component, OnInit } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'product-detail-check-inventory',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, ReactiveFormsModule, NgTemplateOutlet, RouterOutlet, RouterLink],
  templateUrl: './check-inventory.component.html',
})
export class CheckInventoryComponent implements OnInit {
  inventoryFormGroup: FormGroup = new FormGroup({
    code: new FormControl<string>('', [Validators.required, Validators.pattern('^[A-Z]{3,4}\\d{4}$')])
  })
  condeControl = this.inventoryFormGroup.get('code');

  ngOnInit() {
    this.condeControl?.valueChanges.subscribe(value => {
      if (value) {
        this.condeControl?.setValue(value.toUpperCase(), { emitEvent: false })
      }
    })
  }

  checkInventory() {}
}