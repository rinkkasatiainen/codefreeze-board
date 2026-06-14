# Integrated Event Sourcing Plan

This document describes the automatic event publishing mechanism that ensures events appended to the EventStore are automatically published to EventBridge with at-least-once guarantees.

## Overview

When an event is appended to the EventStore, the system **automatically** publishes it to EventBridge. Business capabilities using the event sourcing framework do **not** need to handle event publishing - it happens automatically in the background.

## Key Requirements

1. **Automatic Publishing**: Events are automatically published to EventBridge when appended to EventStore
2. **At-Least-Once Guarantee**: Every event will be published at least once (may be published multiple times in error cases)
3. **Transparency**: Business capabilities don't need to know about or handle publishing
4. **Publishing Status Tracking**: Database tracks which events have been published

## Architecture Changes

### 1. Database Schema Changes

**Updated Events Table**:
```sql
CREATE TABLE events (
    stream_id VARCHAR(255) NOT NULL,
    event_number BIGINT NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    event_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_date TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (stream_id, event_number)
);

CREATE INDEX idx_stream_id ON events(stream_id);
CREATE INDEX idx_stream_event_number ON events(stream_id, event_number);
CREATE INDEX idx_unpublished_events ON events(published, created_at) WHERE published = FALSE;
```

**New Columns**:
- `published` (BOOLEAN, DEFAULT FALSE): Tracks whether the event has been published to EventBridge
- `published_date` (TIMESTAMP): Records when the event was published (NULL until published)

**New Index**:
- `idx_unpublished_events`: Composite index on `(published, created_at)` with a partial index condition (`WHERE published = FALSE`) for efficient querying of unpublished events. This allows fast queries for events that need to be published.

### 2. Automatic Publishing Mechanism

Two-phase approach:

#### Phase 1: Event Append (Synchronous)
- Business capability calls `appendEvent()` from the library
- Event is inserted into EventStore with `published = FALSE`
- Function returns immediately (does NOT wait for EventBridge publishing)
- Publishing happens asynchronously in the background

#### Phase 2: Event Publishing (Asynchronous Background Process)
- A background Lambda function (Event Publisher) periodically queries for unpublished events
- Publishes events to EventBridge
- Updates `published = TRUE` and `published_date` in a transaction
- Handles errors and retries

### 3. Event Publisher Lambda Function

**Purpose**: Background process that ensures all events are published to EventBridge

**Location**: This Lambda is part of the event sourcing infrastructure, not the business capability

**Trigger**: 
- **Option A (Recommended for MVP)**: EventBridge Scheduled Rule (runs every N seconds/minutes)
- **Option B (Future enhancement)**: EventBridge Pipe with RDS CDC (Change Data Capture) - more real-time

**Functionality**:
1. Query EventStore for events where `published = FALSE`
2. Order by `created_at` ascending (publish oldest events first)
3. For each unpublished event:
   - Publish to EventBridge
   - Update event record: set `published = TRUE`, `published_date = NOW()`
   - Use database transaction to ensure atomicity
4. Handle errors gracefully (log, retry next cycle)

**Batch Processing**:
- Process events in batches (e.g., 100 events per invocation)
- Use pagination to handle large backlogs
- Continue processing until no more unpublished events

**Error Handling**:
- If EventBridge publish fails: Log error, leave `published = FALSE`, retry in next cycle
- If database update fails after successful publish: Log error, event may be republished (idempotent in EventBridge)
- Use idempotency keys in EventBridge to prevent duplicate processing on recipient side

### 4. Library Function Changes

#### Updated `appendEvent()` Function

**Before** (from EVENT_SOURCING_PLAN.md):
- Appended event
- Business capability was responsible for publishing

**After** (Integrated):
```javascript
async function appendEvent(streamId, eventType, eventData, expectedVersion, config) {
  // 1. Validate version
  // 2. Insert event with published = FALSE
  // 3. Return event (including event_number)
  // Note: Publishing happens automatically in background
}
```

**Changes**:
- No longer accepts EventBridge config
- Does NOT publish to EventBridge
- Simply inserts event with `published = FALSE`
- Returns immediately

**Removed Function**:
- Business capabilities no longer need to call `publishEvent()` directly
- `publishEvent()` function may still exist internally for the Event Publisher Lambda

## Implementation Details

### CDK Infrastructure Changes

#### New Lambda Function: Event Publisher
**File**: `cdk/lib/event-sourcing-resources.ts`

**Resources**:
- Lambda function for event publishing
- EventBridge Scheduled Rule (triggers every 30 seconds for MVP, configurable)
- IAM permissions:
  - RDS Data API access (read unpublished events, update published status)
  - Secrets Manager read access
  - EventBridge PutEvents permission

**CDK Code**:
```typescript
// Event Publisher Lambda
const eventPublisherLambda = new lambda.Function(this, 'EventPublisherLambda', {
  runtime: lambda.Runtime.NODEJS_22_X,
  handler: 'index.eventPublisherHandler',
  code: lambda.Code.fromAsset(path.join(__dirname, '../event-publisher-lambda')),
  environment: {
    EVENT_STORE_CLUSTER_ARN: eventStoreCluster.clusterArn,
    EVENT_STORE_SECRET_ARN: eventStoreSecret.secretArn,
    EVENT_STORE_DB_NAME: 'eventstore',
    EVENT_BUS_NAME: eventBus.eventBusName,
    AWS_REGION: this.region,
    BATCH_SIZE: '100', // events to process per invocation
  },
  timeout: Duration.minutes(5),
});

// Grant permissions
eventStoreCluster.grantDataApiAccess(eventPublisherLambda);
eventStoreSecret.grantRead(eventPublisherLambda);
eventBus.grantPutEvents(eventPublisherLambda);

// Scheduled Rule (runs every 30 seconds)
new events.Rule(this, 'EventPublisherSchedule', {
  schedule: events.Schedule.rate(Duration.seconds(30)),
  targets: [new targets.LambdaFunction(eventPublisherLambda)],
});
```

**Note**: The Event Publisher Lambda code should be in a separate location (e.g., `cdk/event-publisher-lambda/`) since it's infrastructure code, not part of the `cfb-event-sourcing` library.

### Event Publisher Lambda Implementation

**Location**: `cdk/event-publisher-lambda/` (infrastructure code, not library)

**Structure**:
```
cdk/
├── event-publisher-lambda/
│   ├── package.json
│   ├── index.js
│   └── src/
│       └── event-publisher.js
```

**Implementation**:
```javascript
// event-publisher.js
import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

export async function publishUnpublishedEvents(config) {
  const rdsClient = new RDSDataClient({ region: config.region });
  const eventBridgeClient = new EventBridgeClient({ region: config.region });
  
  const batchSize = parseInt(config.batchSize || '100');
  
  // Query for unpublished events
  const query = `
    SELECT stream_id, event_number, event_type, event_data, event_metadata, created_at
    FROM events
    WHERE published = FALSE
    ORDER BY created_at ASC
    LIMIT $1
  `;
  
  // Execute query, process events, update published status
  // ... (detailed implementation)
}
```

**Publishing Logic**:
1. Query for up to BATCH_SIZE unpublished events
2. For each event:
   - Publish to EventBridge
   - If successful, update `published = TRUE` and `published_date = NOW()`
   - Use transaction to ensure atomicity
3. If EventBridge publish fails, log error and leave `published = FALSE` (will retry next cycle)
4. If all events in batch are processed, query again until no more unpublished events

**Idempotency**:
- EventBridge supports idempotency keys, but for simplicity in MVP, we rely on at-least-once semantics
- Event recipients should be idempotent (handle duplicate events gracefully)
- Future enhancement: Add idempotency key based on `(stream_id, event_number)`

### Database Migration

**Migration Script**: `cdk/scripts/migrate-add-publishing-columns.sql`

```sql
-- Add published and published_date columns
ALTER TABLE events 
ADD COLUMN published BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN published_date TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of unpublished events
CREATE INDEX idx_unpublished_events 
ON events(published, created_at) 
WHERE published = FALSE;

-- For existing events (if any), mark as published
UPDATE events 
SET published = TRUE, published_date = created_at 
WHERE published = FALSE;
```

**Note**: If there are existing events in the database, the migration marks them as published (assuming they were published before this change, or they're historical data).

### Library Changes (cfb-event-sourcing)

#### Updated Functions

**`appendEvent()`** - Simplified:
- Removed EventBridge config parameter
- Insert event with `published = FALSE`
- Return event (no publishing step)

**New Internal Functions** (for Event Publisher Lambda):
- `getUnpublishedEvents(batchSize, config)` - Query for unpublished events
- `markEventAsPublished(streamId, eventNumber, config)` - Update published status

**Removed from Public API**:
- `publishEvent()` - No longer needed by business capabilities (still exists internally for Event Publisher)

### At-Least-Once Guarantee

**How it works**:

1. **Normal Flow**:
   - Event appended with `published = FALSE`
   - Event Publisher Lambda runs, publishes event, sets `published = TRUE`
   - ✅ Event published exactly once

2. **EventBridge Publish Fails**:
   - Event appended with `published = FALSE`
   - Event Publisher Lambda runs, EventBridge publish fails
   - Event remains `published = FALSE`
   - Next cycle retries publishing
   - ✅ Event eventually published (at least once)

3. **Database Update Fails After Successful Publish**:
   - Event appended with `published = FALSE`
   - Event Publisher Lambda runs, EventBridge publish succeeds
   - Database update fails (network issue, etc.)
   - Event remains `published = FALSE`
   - Next cycle republishes to EventBridge
   - ✅ Event published multiple times (at-least-once guarantee)
   - Event recipients must be idempotent

4. **Lambda Crashes Mid-Processing**:
   - Event appended with `published = FALSE`
   - Event Publisher Lambda crashes after publishing but before updating DB
   - Event remains `published = FALSE`
   - Next cycle republishes
   - ✅ Event published multiple times (at-least-once guarantee)

**Idempotency in Event Recipients**:
- Event recipients (projection listeners, etc.) must handle duplicate events
- Use `(stream_id, event_number)` as unique identifier
- Check if event has already been processed before applying

## Implementation Steps

### Phase 1: Database Schema Update
- [ ] Create migration script to add `published` and `published_date` columns
- [ ] Create index `idx_unpublished_events`
- [ ] Test migration on development database
- [ ] Update CDK to apply migration (or manual migration)

### Phase 2: Event Publisher Lambda
- [ ] Create `cdk/event-publisher-lambda/` directory structure
- [ ] Implement event publisher Lambda function
- [ ] Implement query for unpublished events
- [ ] Implement EventBridge publishing
- [ ] Implement database update (mark as published)
- [ ] Add error handling and logging
- [ ] Write unit tests (with mocks)
- [ ] Test locally with test data

### Phase 3: CDK Infrastructure
- [ ] Add Event Publisher Lambda to `event-sourcing-resources.ts`
- [ ] Create EventBridge Scheduled Rule
- [ ] Configure Lambda permissions (RDS, Secrets Manager, EventBridge)
- [ ] Set environment variables
- [ ] Test deployment

### Phase 4: Library Updates
- [ ] Update `appendEvent()` to remove EventBridge publishing
- [ ] Update `appendEvent()` to set `published = FALSE`
- [ ] Remove `publishEvent()` from public API (or mark as deprecated)
- [ ] Add internal functions for Event Publisher Lambda
- [ ] Update tests
- [ ] Update documentation

### Phase 5: Testing
- [ ] Integration test: Append event, verify automatic publishing
- [ ] Test error scenarios (EventBridge failure, database failure)
- [ ] Test at-least-once semantics (simulate failures)
- [ ] Load test: Multiple events appended rapidly
- [ ] Verify no events are lost
- [ ] Verify events are eventually published

## Configuration

### Environment Variables

**Event Publisher Lambda**:
- `EVENT_STORE_CLUSTER_ARN` - RDS cluster ARN
- `EVENT_STORE_SECRET_ARN` - Secrets Manager ARN
- `EVENT_STORE_DB_NAME` - Database name
- `EVENT_BUS_NAME` - EventBridge bus name
- `AWS_REGION` - AWS region
- `BATCH_SIZE` - Number of events to process per invocation (default: 100)

### Tuning Parameters

**Schedule Interval**:
- MVP: 30 seconds (good balance between latency and cost)
- Production: Adjust based on requirements (10 seconds for lower latency, 60 seconds for lower cost)

**Batch Size**:
- MVP: 100 events per invocation
- Production: Adjust based on Lambda timeout and event size
- Consider: Lambda timeout (5 minutes max), event size, network latency

**Optimization**:
- For high-throughput scenarios, consider multiple Event Publisher Lambdas (different partitions)
- Use EventBridge Pipes with RDS CDC for near-real-time publishing (future enhancement)

## Cost Considerations

**Additional Costs**:
- Event Publisher Lambda: ~$0.20 per million invocations
- Lambda execution time: Depends on batch size and event count
- EventBridge: Same as before (events are still published)

**Example** (30-second schedule):
- Invocations per day: 2,880 (24 hours * 60 minutes * 2 per minute)
- Cost: ~$0.0006 per day (~$0.02 per month)
- Very low cost for the reliability guarantee

## Future Enhancements

1. **Real-Time Publishing** (EventBridge Pipes + RDS CDC):
   - Use Aurora Database Activity Streams or DMS CDC
   - Near-real-time publishing (no polling delay)
   - More efficient for high-throughput scenarios

2. **Idempotency Keys**:
   - Add idempotency key to EventBridge events
   - Prevent duplicate processing on recipient side
   - Key format: `{streamId}:{eventNumber}`

3. **Dead Letter Queue**:
   - Events that fail to publish after N retries
   - Send to DLQ for manual investigation
   - Alert on DLQ size

4. **Metrics and Monitoring**:
   - CloudWatch metrics: Unpublished event count, publishing latency
   - Alarms: High unpublished event count, publishing failures
   - Dashboards for visibility

5. **Partitioning**:
   - Multiple Event Publisher Lambdas for high throughput
   - Partition by stream_id or event_number ranges
   - Parallel processing

6. **Transactional Outbox Pattern**:
   - More sophisticated pattern using transactional outbox
   - Ensures exactly-once semantics with two-phase commit
   - More complex, but stronger guarantees

## Comparison: Before vs After

### Before (EVENT_SOURCING_PLAN.md)
```
Business Capability Lambda:
1. appendEvent() → EventStore
2. publishEvent() → EventBridge
3. Handle errors from both operations
```

**Issues**:
- Business capability must handle publishing
- If publish fails, event is in store but not published (inconsistent state)
- No automatic retry mechanism
- Business logic coupled with infrastructure concerns

### After (INTEGRATED_EVENT_SOURCING_PLAN.md)
```
Business Capability Lambda:
1. appendEvent() → EventStore (published = FALSE)
2. Return (publishing happens automatically)

Event Publisher Lambda (Background):
1. Query unpublished events
2. Publish to EventBridge
3. Mark as published
4. Retry on failure
```

**Benefits**:
- Business capability only deals with event storage
- Automatic publishing with retry logic
- At-least-once guarantee
- Separation of concerns (business logic vs infrastructure)
- Events eventually published even if initial publish fails

## Migration Path

For existing implementations using the original plan:

1. **Deploy new infrastructure** (Event Publisher Lambda, database migration)
2. **Update library** (new version of `cfb-event-sourcing`)
3. **Update business capabilities**:
   - Remove `publishEvent()` calls
   - Update `appendEvent()` calls (remove EventBridge config)
   - Deploy updated Lambda functions
4. **Verify**: Check that events are being published automatically
5. **Monitor**: Watch for any unpublished events (should be near zero)

**Backward Compatibility**:
- Old code calling `publishEvent()` will still work (function exists but is a no-op or deprecated)
- Events appended with old code will be automatically published by Event Publisher Lambda

