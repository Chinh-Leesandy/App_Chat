import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/common/types';
import { UsersService } from 'src/users/users.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddMembersDto, UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './room.schema';
import { RoomsService } from './rooms.service';
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly userService: UsersService,
  ) {}

  @Post()
  create(
    @Body() createRoomDto: CreateRoomDto,
    @Req() request: RequestWithUser,
  ) {
    return this.roomsService.create({
      ...createRoomDto,
      adminId: request.user._id,
    });
  }

  @Get()
  async findAll(@Req() req: any) {
    const { _id } = req.user;
    const { min_member } = req.query;
    const user = await this.userService.findOne({
      _id: _id,
    });
    if (!user) throw new BadRequestException('User not found');
    let filter = {};
    console.log('min: ', min_member);
    if (min_member) {
      // filter['members'] = {
      //   $eq: user._id,

      // };

      filter['$and'] = [
        { $expr: { $gt: [{ $size: '$members' }, Number(min_member)] } },
        { members: user._id },
      ];
      // filter = { $expr: { $gte: [{ $size: '$members' }, min] } };
    } else {
      filter['members'] = user._id;
    }
    const rooms = await this.roomsService.findAll(filter, {
      name: 1,
      _id: 1,
      lastMessage: 1,
      members: 1,
    });
    return rooms;
  }

  @Patch('/add-members')
  async addMembers(@Body() body: AddMembersDto) {
    return this.roomsService.addMembers(body.roomId, body.membersId);
  }

  @Get(':id')
  async getRoomById(@Param('id') id: string): Promise<Room> {
    return this.roomsService.getRoomDetail(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }
}
