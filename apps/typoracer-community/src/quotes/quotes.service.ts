import { Injectable } from '@nestjs/common';
import { Quote } from './quotes.models';

const quotes: Quote[] = [
  {
    id: 1,
    image: '/assets/typewriter.jpg',
    alt: 'Old keyboard',
    text: 'Old keyboard',
  },
  {
    id: 2,
    image: '/assets/mechanical-keyboard.webp',
    alt: 'Modern keyboard',
    text: 'Modern keyboard',
  },
  {
    id: 3,
    image: '/assets/an-image.jpg',
    alt: 'Generic',
    text: 'An image with description',
  },
  {
    id: 4,
    image: '/assets/an-image.jpg',
    alt: 'Generic',
    text: 'An image with description',
  },
  {
    id: 5,
    image: '/assets/an-image.jpg',
    alt: 'Generic',
    text: 'An image with description',
  },
];

@Injectable()
export class QuotesService {
  getQuotes(): Quote[] {
    return quotes;
  }

  getQuoteById(quoteId: number): Quote | undefined {
    return quotes.find((quote) => quote.id === quoteId);
  }
}
