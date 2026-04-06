import { Doctor } from '@entities/doctor.entity';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Balance } from 'src/entities/balance.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepo: Repository<Balance>,
    @InjectRepository(Doctor) private readonly userRepo: Repository<Doctor>,
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

  async addUserCredits(
    userId: number,
    amount: number,
    expiry: number,
  ): Promise<boolean> {
    if (amount <= 0) {
      throw new BadRequestException(`invalid amount for credit`);
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`user not found with id ${userId}`);
    }
    const balance = await this.balanceRepo.findOne({
      where: { userId },
      select: ['credits'],
    });

    if (!balance) {
      await this.balanceRepo.save({
        userId,
        credits: amount,
        expiresAt: new Date(Date.now() + expiry * 24 * 60 * 60 * 1000),
      });
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

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`user not found with id ${userId}`);
    }
    const balance = await this.balanceRepo.findOne({
      where: { userId },
    });

    if (!balance || !(await this.hasEnoughCredits(userId, amount))) {
      throw new ForbiddenException('insufficient balance');
    }

    balance.credits -= amount;
    await this.balanceRepo.save(balance);

    return true;
  }
}
