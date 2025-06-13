import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerTdComponent } from './layer-td.component';

describe('LayerTdComponent', () => {
  let component: LayerTdComponent;
  let fixture: ComponentFixture<LayerTdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerTdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayerTdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
