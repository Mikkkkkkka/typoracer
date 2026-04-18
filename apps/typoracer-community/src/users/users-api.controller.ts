import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { DiscussionsService } from '../discussions/discussions.service';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersApiController {
  constructor(
    private readonly usersService: UsersService,
    private readonly discussionsService: DiscussionsService,
  ) {}

  @Get(':username')
  async findOne(@Param('username') username: string) {
    const user = await this.usersService.getUserByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      ...user,
      discussions: await this.discussionsService.getDiscussionsByAuthor(
        user.username,
      ),
    };
  }
}
