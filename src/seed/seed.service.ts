import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { Subscription } from '@entities/subscription.entity';
import { Subscription } from '../entities/subscription.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}
  /**
   * Subscriptions
   */

  subscriptions = [
    {
      id: 1,
      title: 'trial',
      credits: 50,
      expiry: 30,
      description: 'Trial Version',
    },
    {
      id: 2,
      title: 'Basic',
      credits: 100,
      expiry: 30,
      description: 'Basic Version',
    },
    {
      id: 3,
      title: 'Pro',
      credits: 500,
      expiry: 30,
      description: 'Pro Version',
    },
  ];

  async run() {
    try {
      console.log('RUNNING SEEDER ....');
      await this.subscriptionRepo.save(this.subscriptions);
      console.log('SEEDER COMPLETED ....');
    } catch (error) {
      console.log('SEEDER FAILED ....', error);
    }
  }
}
