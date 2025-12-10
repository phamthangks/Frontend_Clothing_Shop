import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  AccountService,
  RegisterRequest,
} from '../../services/account.service';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private accountService: AccountService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)],
      ],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue],
    });
  }

  validatePhoneNumber(event: any) {
    let input = event.target.value.replace(/[^0-9]/g, '');
    if (input.length > 11) {
      input = input.slice(0, 11);
    }
    this.registerForm.controls['phoneNumber'].setValue(input, {
      emitEvent: false,
    });
  }

  async registerUser() {
    if (this.registerForm.invalid) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const { fullName, phoneNumber, password, confirmPassword } =
      this.registerForm.value;

    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    const requestBody: RegisterRequest = {
      fullName,
      phoneNumber,
      password,
    };

    try {
      await firstValueFrom(this.accountService.register(requestBody));
      alert(
        'Đăng ký thành công! Mã OTP đã được gửi tới số điện thoại của bạn.'
      );
      // Điều hướng đến trang xác nhận OTP
      this.router.navigate(['admin/verify-otp'], {
        replaceUrl: true,
        queryParams: { phone: phoneNumber },
      });
    } catch (error: any) {
      alert(error.error?.Message || 'Đăng ký thất bại');
    }
  }
}
