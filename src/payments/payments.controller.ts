import { Controller, HttpCode, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}
  @Post()
  @HttpCode(200)
  createPayment() {
    return this.paymentService.createPayment();
  }

  @Post('verify')
  @HttpCode(200)
  verifyPayment() {
    return this.paymentService.verifyPayment();
  }
}
