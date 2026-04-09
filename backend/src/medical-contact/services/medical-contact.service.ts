import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalContact, MedicalContactDocument } from '../schemas/medical-contact.schema';
import { CreateMedicalContactDto } from '../dto/medical-contact.dto';
import { UpdateMedicalContactDto } from '../dto/medical-contact.dto';

@Injectable()
export class MedicalContactService {
  constructor(
    @InjectModel(MedicalContact.name) private medicalContactModel: Model<MedicalContactDocument>,
  ) {}

  async create(createDto: CreateMedicalContactDto): Promise<MedicalContact> {
    const created = new this.medicalContactModel(createDto);
    return created.save();
  }

  async findAll(
    page = 1,
    limit = 20,
    type?: string,
    search?: string,
  ): Promise<{ data: MedicalContact[]; total: number }> {
    const filter: any = {};
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.medicalContactModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.medicalContactModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findPublic(
    type?: string,
    search?: string,
  ): Promise<MedicalContact[]> {
    const filter: any = { isActive: true };
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    return this.medicalContactModel.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<MedicalContact> {
    const found = await this.medicalContactModel.findById(id).exec();
    if (!found) {
      throw new NotFoundException('جهة الاتصال غير موجودة');
    }
    return found;
  }

  async update(id: string, updateDto: UpdateMedicalContactDto): Promise<MedicalContact> {
    const updated = await this.medicalContactModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true, runValidators: true },
    ).exec();
    if (!updated) {
      throw new NotFoundException('جهة الاتصال غير موجودة');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.medicalContactModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('جهة الاتصال غير موجودة');
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.medicalContactModel.deleteMany({ _id: { $in: ids } }).exec();
  }

  async getStats(): Promise<{ total: number; hospitals: number; clinics: number; doctors: number }> {
    const [total, hospitals, clinics, doctors] = await Promise.all([
      this.medicalContactModel.countDocuments(),
      this.medicalContactModel.countDocuments({ type: 'hospital' }),
      this.medicalContactModel.countDocuments({ type: 'clinic' }),
      this.medicalContactModel.countDocuments({ type: 'doctor' }),
    ]);

    return { total, hospitals, clinics, doctors };
  }
}
