import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';

@Controller('api/attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.attemptsService.create(this.parseCreateAttemptDto(body));
  }

  @Get()
  findAll() {
    return this.attemptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attemptsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.attemptsService.update(id, this.parseUpdateAttemptDto(body));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attemptsService.remove(id);
  }

  private parseCreateAttemptDto(
    body: Record<string, unknown>,
  ): CreateAttemptDto {
    return {
      quoteId: this.requirePositiveNumber(body.quoteId, 'quoteId'),
      userId: this.requirePositiveNumber(body.userId, 'userId'),
      accuracy: this.requirePositiveNumber(body.accuracy, 'accuracy'),
      wpm: this.requirePositiveNumber(body.wpm, 'wpm'),
      maxRawWpm: this.requirePositiveNumber(body.maxRawWpm, 'maxRawWpm'),
    };
  }

  private parseUpdateAttemptDto(
    body: Record<string, unknown>,
  ): UpdateAttemptDto {
    const attempt: UpdateAttemptDto = {};

    if (body.quoteId !== undefined) {
      attempt.quoteId = this.requirePositiveNumber(body.quoteId, 'quoteId');
    }

    if (body.userId !== undefined) {
      attempt.userId = this.requirePositiveNumber(body.userId, 'userId');
    }

    if (body.accuracy !== undefined) {
      attempt.accuracy = this.requirePositiveNumber(body.accuracy, 'accuracy');
    }

    if (body.wpm !== undefined) {
      attempt.wpm = this.requirePositiveNumber(body.wpm, 'wpm');
    }

    if (body.maxRawWpm !== undefined) {
      attempt.maxRawWpm = this.requirePositiveNumber(
        body.maxRawWpm,
        'maxRawWpm',
      );
    }

    if (Object.keys(attempt).length === 0) {
      throw new BadRequestException('Provide at least one field to update.');
    }

    return attempt;
  }

  private requirePositiveNumber(value: unknown, field: string) {
    const parsedValue =
      typeof value === 'number' ? value : Number.parseFloat(String(value));

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      throw new BadRequestException(`${field} must be a positive number.`);
    }

    return parsedValue;
  }
}
