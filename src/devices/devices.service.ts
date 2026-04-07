import { Appointment } from '@entities/appointment.entity';
import { DeviceToken } from '@entities/device_token.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseDto } from 'src/dto/api-response.dto';
import { DeviceCreateDto } from 'src/dto/device_token.dto';
import { Repository } from 'typeorm';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepo: Repository<DeviceToken>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}
  async create(userId: number, createDeviceDto: DeviceCreateDto) {
    // find appointment
    const appointment = await this.appointmentRepo.findOne({
      where: {
        id: createDeviceDto.appointmentId,
        doctor_id: userId,
        patient_id: createDeviceDto.patientId,
        active: true,
      },
    });

    if (!appointment) {
      throw new HttpException(
        'no appointment found with given details',
        HttpStatus.NOT_FOUND,
      );
    }

    // create token
    const token = crypto.randomUUID();

    // save token
    const newDevice = this.deviceTokenRepo.create({
      patientId: createDeviceDto.patientId,
      appointmentId: createDeviceDto.appointmentId,
      token,
    });
    await this.deviceTokenRepo.save(newDevice);

    return new ApiResponseDto('device register', { token });
  }

  findAll() {
    return `This action returns all devices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} device`;
  }

  remove(id: number) {
    return `This action removes a #${id} device`;
  }
}
