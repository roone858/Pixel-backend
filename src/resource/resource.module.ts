import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { ResourceSchema } from './schemas/resource.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    PaymentModule,
    MongooseModule.forFeature([{ name: 'Resource', schema: ResourceSchema }]),
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule {}
