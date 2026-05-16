import {
  Header,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationLinkHeader } from '../common/pagination/pagination-links';
import { CreateQuoteSubmissionFormDataDto } from './dto/create-quote-submission-form-data.dto';
import { CreateQuoteSubmissionDto } from './dto/create-quote-submission.dto';
import { QuoteDetailDto } from './dto/quote-detail.dto';
import { QuoteSubmissionResponseDto } from './dto/quote-submission-response.dto';
import { QuoteSummaryDto } from './dto/quote-summary.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuotesService } from './quotes.service';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@ApiTags('quotes')
@Controller('api/quotes')
export class QuotesApiController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'List approved quotes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: QuoteSummaryDto, isArray: true })
  @Header('Cache-Control', 'public, max-age=3600, must-revalidate')
  @Get()
  async findAll(
    @Query() pagination: PaginationQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.quotesService.findAll(pagination);
    const linkHeader = buildPaginationLinkHeader(
      request,
      pagination,
      result.hasNextPage,
    );

    if (linkHeader) {
      response.setHeader('Link', linkHeader);
    }

    return result.items;
  }

  @ApiOperation({ summary: 'Submit a quote for moderation' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiCreatedResponse({ type: QuoteSubmissionResponseDto })
  @ApiBody({ type: CreateQuoteSubmissionFormDataDto })
  @ApiBadRequestResponse({ description: 'Invalid quote payload.' })
  @ApiNotFoundResponse({ description: 'Author was not found.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() body: CreateQuoteSubmissionDto,
    @Req() request: Request,
    @UploadedFile() image?: UploadedImageFile,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const uploadedImage = image
      ? await this.quotesService.uploadQuoteImage({
          buffer: image.buffer,
          mimeType: image.mimetype,
          originalName: image.originalname,
        })
      : null;
    const quote = await this.quotesService.submitQuote({
      authorUsername: currentUser.username,
      text: body.text,
      source: body.source,
      imageUrl: uploadedImage?.url ?? null,
      imageAlt: body.source || image?.originalname || 'Submitted quote',
    });

    if (!quote) {
      throw new NotFoundException('Author not found.');
    }

    return quote;
  }

  @ApiOperation({ summary: 'Get quote details with records' })
  @ApiOkResponse({ type: QuoteDetailDto })
  @ApiNotFoundResponse({ description: 'Quote was not found.' })
  @Header('Cache-Control', 'public, max-age=3600, must-revalidate')
  @Get(':quoteId')
  async findOne(@Param('quoteId', ParseIntPipe) quoteId: number) {
    const quote = await this.quotesService.findOne(quoteId);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    return quote;
  }

  @ApiOperation({ summary: 'Update a submitted quote' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOkResponse({ type: QuoteSubmissionResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid quote payload.' })
  @ApiForbiddenResponse({
    description: 'You can only edit your own quotes.',
  })
  @ApiNotFoundResponse({ description: 'Quote was not found.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @Patch(':quoteId')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Body() body: UpdateQuoteDto,
    @Req() request: Request,
    @UploadedFile() image?: UploadedImageFile,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const uploadedImage = image
      ? await this.quotesService.uploadQuoteImage({
          buffer: image.buffer,
          mimeType: image.mimetype,
          originalName: image.originalname,
        })
      : null;

    try {
      const quote = await this.quotesService.updateQuote(
        quoteId,
        currentUser.username,
        {
          ...body,
          imageUrl: uploadedImage?.url,
          imageAlt: image
            ? body.source || image.originalname || 'Submitted quote'
            : undefined,
        },
      );

      if (!quote) {
        throw new NotFoundException('Quote not found.');
      }

      return quote;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw error;
    }
  }

  @ApiOperation({ summary: 'Delete a submitted quote' })
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Quote deleted.' })
  @ApiForbiddenResponse({
    description: 'You can only delete your own quotes.',
  })
  @ApiNotFoundResponse({ description: 'Quote was not found.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @Delete(':quoteId')
  @HttpCode(204)
  async remove(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Req() request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);

    try {
      const deleted = await this.quotesService.deleteQuote(
        quoteId,
        currentUser.username,
      );

      if (!deleted) {
        throw new NotFoundException('Quote not found.');
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw error;
    }
  }
}
