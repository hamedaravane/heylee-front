import { Component, inject } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '../data-access/auth.facade';
import { AuthRequest } from '../entity/auth.entity';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AsyncPipe } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'login',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, ReactiveFormsModule, NzIconModule, AsyncPipe],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly nzMessageService = inject(NzMessageService);
  passwordVisible = false;
  loginLoading$ = this.authFacade.loginLoading$;

  loginForm = new FormGroup({
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required])
  })

  login() {
    const authRequest = this.loginForm.value as AuthRequest;
    this.authFacade.login(authRequest).then(() => {
      this.nzMessageService.success('با موفقیت وارد شدید');
      this.router.navigateByUrl('/').then();
    });
  }
}
