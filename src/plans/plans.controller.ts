import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { Plan } from './schemas/plan.schema';
import { CreatePlanDto } from './dto/create-plan.dto';
import { AdminGuard } from 'src/users/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post()
  async create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  async findAll(): Promise<Plan[]> {
    return this.plansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Plan> {
    return this.plansService.findOne(id);
  }
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdatePlanDto,
  ): Promise<Plan> {
    return this.plansService.update(id, data);
  }
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Plan> {
    return this.plansService.delete(id);
  }
}
