import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/select';
import { AccountService } from '../../../core/services/account.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { switchMap } from 'rxjs';
import { SnackBarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatCard, MatFormField, MatInput, MatButton, MatLabel, MatIcon, RouterLink, MatSuffix, MatIconButton],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private snack = inject(SnackBarService);
  returnUrl = '/shop';
  hidePassword = true;

  constructor() {
    const url = this.activatedRoute.snapshot.queryParams['returnUrl'];
    if (url) this.returnUrl = url;
  }

  loginForm = this.fb.group({
    email: [''],
    password: [''],
  });

  onSubmit() {
  this.accountService.login(this.loginForm.value)
    .pipe(
      switchMap(() => this.accountService.getUserInfo()),
    )
    .subscribe({
      next: (response) => {
        // Read the standard HTTP status directly from the response object
        if (response.status === 204) {
          this.snack.error('Register yourself first');
          this.router.navigateByUrl('/account/register');
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        console.error('Authentication process failed', err);
        this.snack.error('Authentication process failed');
      },
    });;
  }
}
