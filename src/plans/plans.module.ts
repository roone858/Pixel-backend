import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { Plan, PlanSchema } from './schemas/plan.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService, MongooseModule], // إذا كنت تريد استخدام الخدمة في موديولات أخرى
})
export class PlansModule {}
