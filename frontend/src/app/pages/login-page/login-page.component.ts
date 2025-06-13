import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {Router} from '@angular/router';

import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {InputTextModule} from 'primeng/inputtext';
import {MessageModule} from 'primeng/message';
import {ToastModule} from 'primeng/toast';
import {firstValueFrom} from 'rxjs';

import {Constants} from '../../models/constants';
import {Login} from '../../models/login.model';
import {AuthService} from '../../services/auth.service';
import {StateService} from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly stateService = inject(StateService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  formGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d])[a-zA-Z\\d\\W]{6,20}$'),
    ]),
  });

  get passwordControl() {
    return this.formGroup.get('password')!;
  }

  async onSubmit() {
    if (this.formGroup.get('username')?.value === 'admin') {
      await this.login();
    } else {
      if (this.formGroup.valid) {
        await this.login();
      } else {
        this.formGroup.markAllAsTouched();
        this.formGroup.updateValueAndValidity();
      }
    }
  }

  private async login() {
    try {
      this.stateService.setIsLoadingState(true);
      const formValues = this.formGroup.getRawValue();
      const login: Login = {
        ...formValues,
      } as Login;
      const accessToken = await firstValueFrom(this.authService.login(login));
      this.authService.setToken(accessToken.accessToken);
      await this.router.navigate(['/admin']);
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR',
        detail: Constants.ERROR_MESSAGE,
      });
    } finally {
      this.stateService.setIsLoadingState(false);
    }
  }
}
