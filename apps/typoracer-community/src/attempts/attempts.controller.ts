import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { Attempt } from './entities/attempt.entity';

@ApiTags('attempts')
@Controller('api/attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @ApiOperation({ summary: 'Create a typing attempt' })
  @ApiCreatedResponse({ type: Attempt })
  @ApiBadRequestResponse({ description: 'Invalid attempt payload.' })
  @ApiNotFoundResponse({ description: 'Related quote or user was not found.' })
  @Post()
  create(@Body() body: CreateAttemptDto) {
    return this.attemptsService.create({
      ...body,
      maxRawWpm: body.maxRawWpm ?? body.wpm,
    });
  }

  @ApiOperation({ summary: 'List all attempts' })
  @ApiOkResponse({ type: Attempt, isArray: true })
  @Get()
  findAll() {
    return this.attemptsService.findAll();
  }

  @ApiOperation({ summary: 'Get an attempt by id' })
  @ApiOkResponse({ type: Attempt })
  @ApiNotFoundResponse({ description: 'Attempt was not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attemptsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an attempt' })
  @ApiOkResponse({ type: Attempt })
  @ApiBadRequestResponse({ description: 'Invalid update payload.' })
  @ApiNotFoundResponse({
    description: 'Attempt, quote, or user was not found.',
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAttemptDto,
  ) {
    return this.attemptsService.update(id, body);
  }

  @ApiOperation({ summary: 'Delete an attempt' })
  @ApiOkResponse({ type: Attempt })
  @ApiNoContentResponse({ description: 'Attempt deleted.' })
  @ApiNotFoundResponse({ description: 'Attempt was not found.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attemptsService.remove(id);
  }
}
