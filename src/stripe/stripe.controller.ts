import { Controller } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  // @Post('create-subscription')
  // async createSubscription(
  //   @Body('name') name: string,
  //   @Body('email') email: string,
  //   @Body('paymentMethodId') paymentMethodId: string,
  //   @Body('planId') planId: string,
  // ) {
  //   return this.stripeService.createSubscription(
  //     name,
  //     email,
  //     paymentMethodId,
  //     planId,
  //   );
  // }

  // @Post('webhook')
  // async handleWebhook(@Req() req: Request, @Res() res: Response) {
  //   const event = req.body;

  //   if (event.type === 'invoice.payment_succeeded') {
  //     const subscriptionId = event.data.object.subscription;
  //     console.log(
  //       `✅ تم تأكيد الدفع بنجاح! Subscription ID: ${subscriptionId}`,
  //     );
  //   }

  //   res.status(200).send();
  // }
}
