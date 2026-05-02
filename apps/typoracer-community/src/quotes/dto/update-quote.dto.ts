import { PartialType } from '@nestjs/swagger';
import { CreateQuoteSubmissionDto } from './create-quote-submission.dto';

export class UpdateQuoteDto extends PartialType(CreateQuoteSubmissionDto) {}
