import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RodadaPage } from './rodada.page';

describe('RodadaPage', () => {
  let component: RodadaPage;
  let fixture: ComponentFixture<RodadaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RodadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
