import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseDto } from 'src/dto/api-response.dto';
import { Subscription } from 'src/entities/subscription.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}
  async findAll() {
    try {
      const res = await this.subscriptionRepo.findAndCount();
      return new ApiResponseDto('subscriptions found successfully.', res);
    } catch (error) {
      throw new HttpException(
        'failed to load subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const res = await this.subscriptionRepo.findOne({ where: { id } });
      return new ApiResponseDto('subscription found successfully.', res);
    } catch (error) {
      throw new HttpException(
        'failed to load subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
