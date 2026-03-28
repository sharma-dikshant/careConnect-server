import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Balance } from 'src/entities/balance.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepo: Repository<Balance>,
  ) {}

  async getUserCredits(userId: number): Promise<number> {
    const balance = await this.balanceRepo.findOne({
      where: { userId },
      select: ['credits'],
    });
    if (!balance) {
      return 0;
    }

    return balance.credits;
  }

  async hasEnoughCredits(userId: number, amount: number): Promise<boolean> {
    const balance = await this.balanceRepo.findOne({ where: { userId } });
    if (!balance || balance.expiresAt < new Date() || balance.credits < amount)
      return false;

    return true;
  }

  async addUserCredits(userId: number, amount: number): Promise<boolean> {
    if (amount <= 0) {
      throw new BadRequestException(`invalid amount for credit`);
    }
    const balance = await this.balanceRepo.findOne({
      where: { userId },
      select: ['credits'],
    });

    if (!balance) {
      await this.balanceRepo.save({ userId, credits: amount });
      return true;
    }

    balance.credits += amount;
    await this.balanceRepo.save(balance);

    return true;
  }

  async debitUserCredits(userId: number, amount: number): Promise<boolean> {
    if (amount <= 0) {
      throw new BadRequestException(`invalid amount for debit`);
    }

    const balance = await this.balanceRepo.findOne({
      where: { userId },
      select: ['credits'],
    });

    if (!balance || !(await this.hasEnoughCredits(userId, amount))) {
      throw new ForbiddenException('insufficient balance');
    }

    balance.credits -= amount;
    await this.balanceRepo.save(balance);

    return true;
  }
}
