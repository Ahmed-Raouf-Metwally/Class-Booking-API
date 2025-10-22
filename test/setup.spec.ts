import { Test } from '@nestjs/testing';

describe('NestJS Setup Test', () => {
  it('should test NestJS setup', async () => {
    class TestService {
      getHello() {
        return 'Hello World';
      }
    }

    const moduleRef = await Test.createTestingModule({
      providers: [TestService],
    }).compile();

    const service = moduleRef.get(TestService);

    expect(service).toBeDefined();
    expect(service.getHello()).toBe('Hello World');
  });
});
