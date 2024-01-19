// payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async createPayment(payment: Payment): Promise<Payment> {
    const createdPayment = new this.paymentModel(payment);
    return createdPayment.save();
  }

  async findAllPayments(): Promise<Payment[]> {
    return this.paymentModel.find().exec();
  }

  async findPaymentById(id: string): Promise<Payment> {
    return this.paymentModel.findById(id).exec();
  }
  async findPaymentByUserId(userId: string): Promise<Payment> {
    return this.paymentModel.findOne({ userId }).exec();
  }
  async isPaymentNotExpired(userId: string): Promise<boolean> {
    const userPayment = await this.findPaymentByUserId(userId);
    if (userPayment && userPayment.subscriptionDetails.endDate) {
      return new Date() <= new Date(userPayment.subscriptionDetails.endDate);
    }
    return false;
  }
}
