import { Controller, Delete } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Delete()
  //     @UseGuards(AdminGuard)
  async deleteAll() {
    return this.stripeService.cancelAllActiveSubscriptions();
  }
}
