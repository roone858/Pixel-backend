import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // لاستعمال متغيرات البيئة
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService], // لو هنستخدم الخدمة في مكان آخر
})
export class StripeModule {}
