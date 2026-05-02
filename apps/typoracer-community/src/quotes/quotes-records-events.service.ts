import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, interval, map, merge, of } from 'rxjs';
import { QuoteRecordsPayload } from './entities/quote.entity';

@Injectable()
export class QuotesRecordsEventsService {
  private readonly streams = new Map<number, Subject<QuoteRecordsPayload>>();

  createStream(
    quoteId: number,
    initialPayload: QuoteRecordsPayload,
  ): Observable<MessageEvent> {
    const stream = this.getStream(quoteId);

    return merge(
      of({
        type: 'records',
        data: initialPayload,
      } satisfies MessageEvent),
      stream.pipe(
        map(
          (payload) =>
            ({
              type: 'records',
              data: payload,
            }) satisfies MessageEvent,
        ),
      ),
      interval(25000).pipe(
        map(
          () =>
            ({
              type: 'heartbeat',
              data: { quoteId, updatedAt: new Date().toISOString() },
            }) satisfies MessageEvent,
        ),
      ),
    );
  }

  publish(quoteId: number, payload: QuoteRecordsPayload) {
    this.getStream(quoteId).next(payload);
  }

  private getStream(quoteId: number) {
    let stream = this.streams.get(quoteId);

    if (!stream) {
      stream = new Subject<QuoteRecordsPayload>();
      this.streams.set(quoteId, stream);
    }

    return stream;
  }
}
