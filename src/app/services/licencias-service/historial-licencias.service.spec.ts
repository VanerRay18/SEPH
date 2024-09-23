import { TestBed } from '@angular/core/testing';

import { HistorialLicenciasService } from './historial-licencias.service';

describe('HistorialLicenciasService', () => {
  let service: HistorialLicenciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistorialLicenciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
