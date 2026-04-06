import { Transaction } from '@entities/transaction.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async createPayment() {
    return 'payment created';
  }

  async verifyPayment() {
    return 'payement verified';
  }
}
