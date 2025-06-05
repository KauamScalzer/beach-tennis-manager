import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCampeonatoModalComponent } from './add-campeonato-modal.component';

describe('AddCampeonatoModalComponent', () => {
  let component: AddCampeonatoModalComponent;
  let fixture: ComponentFixture<AddCampeonatoModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AddCampeonatoModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCampeonatoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
