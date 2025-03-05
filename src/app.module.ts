import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ResourceModule } from './resource/resource.module';
import { CategoryModule } from './category/category.module';
import { StripeModule } from './stripe/stripe.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    UsersModule,
    ResourceModule,
    MailModule,
    AuthModule,
    ResourceModule,
    CategoryModule,
    SubscriptionModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
