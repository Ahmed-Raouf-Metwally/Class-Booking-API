import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from '../src/classes/classes.service';

describe('ClassesService', () => {
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassesService],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllClasses', () => {
    it('should return all classes', async () => {
      // اختبار جلب جميع الفصول
    });
  });
});
