import { Module } from '@nestjs/common';
import { PDFGeneratorService } from './pdf-generator.service';

@Module({
  providers: [PDFGeneratorService],
  exports: [PDFGeneratorService],
})
export class PDFModule {}
