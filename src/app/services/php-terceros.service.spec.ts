import { TestBed } from '@angular/core/testing';

import { PhpTercerosService } from './php-terceros.service';

describe('PhpTercerosService', () => {
  let service: PhpTercerosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhpTercerosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
