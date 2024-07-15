import {Component, inject} from "@angular/core";
import {NzFormModule} from "ng-zorro-antd/form";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthFacade} from "../data-access/auth.facade";
import {AuthRequest} from "../entity/auth.entity";
import {Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";

@Component({
  selector: 'login',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly nzMessageService = inject(NzMessageService);

  loginForm = new FormGroup({
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required])
  })

  login() {
    const authRequest = this.loginForm.value as AuthRequest;
    this.authFacade.login(authRequest).then(() => {
      this.router.navigate(['/home']).then(() => {
        this.nzMessageService.success('Login successful');
      });
    });
  }
}
