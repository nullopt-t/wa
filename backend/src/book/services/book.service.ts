import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from '../schemas/book.schema';
import { CreateBookDto, UpdateBookDto } from '../dto/book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  async create(createDto: CreateBookDto): Promise<Book> {
    const createdBook = new this.bookModel(createDto);
    return createdBook.save();
  }

  async findAll(query: any): Promise<any> {
    const {
      page = 1,
      limit = 12,
      featured,
      excludeFeatured,
      search,
    } = query;

    const filter: any = { isActive: true };

    if (excludeFeatured === 'true') {
      filter.isFeatured = { $ne: true };
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const books = await this.bookModel
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.bookModel.countDocuments(filter);

    return {
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  async findAllForAdmin(query: any): Promise<any> {
    const { page = 1, limit = 20 } = query;

    const books = await this.bookModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.bookModel.countDocuments({});

    return {
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  }

  async findFeatured(limit = 6): Promise<Book[]> {
    return this.bookModel
      .find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();

    if (!book) {
      throw new NotFoundException('الكتاب غير موجود');
    }

    return book;
  }

  async findBySlug(slug: string): Promise<Book> {
    const book = await this.bookModel.findOne({ slug }).exec();

    if (!book) {
      throw new NotFoundException('الكتاب غير موجود');
    }

    return book;
  }

  async update(id: string, updateDto: UpdateBookDto): Promise<Book> {
    const updated = await this.bookModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('الكتاب غير موجود');
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException('الكتاب غير موجود');
    }
  }
}
