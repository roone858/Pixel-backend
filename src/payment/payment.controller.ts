// payment.controller.ts
import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { Payment } from './schemas/payment.schema';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async processPayment(
    @Body('amount') amount: number,
    @User() { _id },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body('payment_method_data') data: any,
  ) {
    try {
      console.log(data);
      const paymentIntent = await this.paymentService.createPaymentIntent(
        amount,
        data,
        _id,
      );
      return { success: true, paymentIntent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // async createPayment(
  //   @Body() payment: Payment,
  //   @User() { _id },
  // ): Promise<Payment> {
  //   return this.paymentService.createPayment({ ...payment, userId: _id });
  // }

  @Get()
  async getAllPayments(): Promise<Payment[]> {
    return this.paymentService.findAllPayments();
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: string): Promise<Payment> {
    return this.paymentService.findPaymentById(id);
  }
}
