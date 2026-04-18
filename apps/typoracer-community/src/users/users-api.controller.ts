import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DiscussionsService } from '../discussions/discussions.service';
import { UserProfileWithDiscussionsDto } from './users-api.models';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/users')
export class UsersApiController {
  constructor(
    private readonly usersService: UsersService,
    private readonly discussionsService: DiscussionsService,
  ) {}

  @ApiOperation({ summary: 'Get a user profile by username' })
  @ApiOkResponse({ type: UserProfileWithDiscussionsDto })
  @ApiNotFoundResponse({ description: 'User was not found.' })
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
