import { PatientsService } from './patients.service';

export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}
}
