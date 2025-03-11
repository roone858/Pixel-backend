import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan } from './schemas/plan.schema';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  static UsersService: Provider;
  constructor(@InjectModel(Plan.name) private planModel: Model<Plan>) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const newPlan = new this.planModel(createPlanDto);
    return newPlan.save();
  }

  async findAll(): Promise<Plan[]> {
    return this.planModel.find().exec();
  }

  async findOne(id: string): Promise<Plan> {
    return this.planModel.findById(id).exec();
  }

  async update(id: string, data: UpdatePlanDto): Promise<Plan> {
    return await this.planModel.findByIdAndUpdate(id, data, { new: true });
  }
  async delete(id: string): Promise<Plan> {
    return this.planModel.findByIdAndDelete(id).exec();
  }
}
