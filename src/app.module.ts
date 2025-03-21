import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ResourceModule } from './resource/resource.module';
import { CategoryModule } from './category/category.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SubscriptionMiddleware } from './common/middleware/subscription.middleware';
import { JwtModule } from '@nestjs/jwt';
import { PlansModule } from './plans/plans.module';

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
    JwtModule,
    ResourceModule,
    CategoryModule,
    SubscriptionModule,
    PlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SubscriptionMiddleware).forRoutes('*'); // Applies globally
  }
}
