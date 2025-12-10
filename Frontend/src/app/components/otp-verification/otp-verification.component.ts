import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
})
export class OtpVerificationComponent {
  otpForm: FormGroup;
  phoneNumber: string = '';

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.otpForm = this.fb.group({
      otp: ['', Validators.required],
    });
    this.route.queryParams.subscribe((params) => {
      this.phoneNumber = params['phone'] || '';
    });
  }

  async verifyOtp() {
    const otp = this.otpForm.value.otp;
    try {
      await firstValueFrom(
        this.accountService.verifyOtp({ phoneNumber: this.phoneNumber, otp })
      );
      alert('Xác thực OTP thành công!');
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (error: any) {
      alert(error.error?.Message || 'Xác thực OTP thất bại');
    }
  }
}
