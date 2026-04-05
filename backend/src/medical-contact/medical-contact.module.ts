import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalContactController } from './controllers/medical-contact.controller';
import { MedicalContactService } from './services/medical-contact.service';
import { MedicalContact, MedicalContactSchema } from './schemas/medical-contact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicalContact.name, schema: MedicalContactSchema },
    ]),
  ],
  controllers: [MedicalContactController],
  providers: [MedicalContactService],
  exports: [MedicalContactService],
})
export class MedicalContactModule {}
