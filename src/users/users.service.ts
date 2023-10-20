import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable, UploadedFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { extname } from 'path';
import { Attachment } from 'src/attachments/attachment.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll(
    filter: FilterQuery<User>,
    returnFields?: { [key: string]: 0 | 1 },
    queryOptions?: QueryOptions,
  ): Promise<User[]> {
    return this.userModel.find(filter, returnFields, queryOptions).exec();
  }
  async findOne(
    filter: FilterQuery<User>,
    returnedFields?: { [key: string]: 0 | 1 },
    options?: QueryOptions<User>,
  ) {
    return await this.userModel.findOne(filter, returnedFields, options).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userModel.findOneAndUpdate({ _id: id }, updateUserDto);
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async getUserMetaData(
    filter: FilterQuery<User>,
    returnFields?: (keyof User)[],
    options?: QueryOptions,
  ): Promise<User[]> {
    return this.userModel
      .find(filter, returnFields, options)
      .populate({
        path: 'avatar',
        select: ['_id', 'mimetype'],
      })
      .exec();
  }

  async updateAvatarProfile(
    token: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const ext = extname(file.originalname);
      const payload = this.jwtService.decode(token.replace('Bearer ', ''));
      console.log('sub: ', payload.sub);
      const avatar = `avatars/${payload.sub}${ext}` + '?time=' + Date.now();
      await this.userModel.findOneAndUpdate({ _id: payload.sub }, { avatar });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
