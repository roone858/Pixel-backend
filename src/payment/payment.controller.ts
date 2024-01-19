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
  async createPayment(
    @Body() payment: Payment,
    @User() { _id },
  ): Promise<Payment> {
    return this.paymentService.createPayment({ ...payment, userId: _id });
  }

  @Get()
  async getAllPayments(): Promise<Payment[]> {
    return this.paymentService.findAllPayments();
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: string): Promise<Payment> {
    return this.paymentService.findPaymentById(id);
  }
}
