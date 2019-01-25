import { BarModule } from './bar.module';

describe('BarModule', () => {
  let barModule: BarModule;

  beforeEach(() => {
    barModule = new BarModule();
  });

  it('should create an instance', () => {
    expect(barModule).toBeTruthy();
  });
});
