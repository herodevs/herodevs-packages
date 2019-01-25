import { FooModule } from './foo.module';

describe('FooModule', () => {
  let fooModule: FooModule;

  beforeEach(() => {
    fooModule = new FooModule();
  });

  it('should create an instance', () => {
    expect(fooModule).toBeTruthy();
  });
});
