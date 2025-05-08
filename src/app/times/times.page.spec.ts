import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimesPage } from './times.page';

describe('TimesPage', () => {
  let component: TimesPage;
  let fixture: ComponentFixture<TimesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
