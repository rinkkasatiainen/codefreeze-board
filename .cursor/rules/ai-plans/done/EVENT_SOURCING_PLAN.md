# Event Sourcing Framework Plan

This document outlines the plan for implementing a simple event sourcing framework using AWS services.

## Architecture Overview

**Note**: The Lambda functions shown below are created by business capabilities, not by this framework. The `cfb-event-sourcing` package provides library functions that these Lambdas use.

```
┌─────────────┐
│   API GW    │
│  (Write)    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│   Lambda (Business Capability)  │
│   Uses: appendEvent()           │
│   - Validates version           │
│   - Appends to EventStore       │
│   - Publishes to EventBridge    │
└──────┬──────────────────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  Aurora     │  │ EventBridge  │  │   Lambda     │
│  PostgreSQL │  │  (Event Bus) │  │ (Business    │
│ EventStore  │  └──────┬───────┘  │  Capability) │
│             │         │          │  Uses:       │
└─────────────┘         │          │  replayEvents│
                        │          │  updateProj. │
                        │          └──────┬───────┘
                        │                 │
                        │                 ▼
                        │          ┌──────────────┐
                        │          │  DynamoDB    │
                        └─────────▶│  Projection  │
                                   └──────────────┘
```

## Components

### 1. EventStore (Aurora PostgreSQL Serverless v2)

**Purpose**: Append-only event storage optimized for fast reads

**Schema**:
```sql
CREATE TABLE events (
    stream_id VARCHAR(255) NOT NULL,
    event_number BIGINT NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    event_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (stream_id, event_number)
);

CREATE INDEX idx_stream_id ON events(stream_id);
CREATE INDEX idx_stream_event_number ON events(stream_id, event_number);
```

**Key Features**:
- Composite primary key: `(stream_id, event_number)`
- `event_number` is managed by the application layer (not auto-increment) - each append operation calculates the next event number based on the current stream version
- Optimized indexes for reading events by stream (composite index on stream_id + event_number covers most queries)
- JSONB for flexible event data storage

**Note on indexes**: The `idx_event_number` index is not needed since we always query by `stream_id` first, and the composite primary key `(stream_id, event_number)` already provides efficient access. The `idx_stream_event_number` composite index supports range queries within a stream.

### 2. Event Bus (Amazon EventBridge)

**Purpose**: Publish all events for projection listeners

**Structure**:
- Custom event bus: `codefreeze-event-bus`
- Event pattern: All events from EventStore
- Event format:
  ```json
  {
    "source": "event-store",
    "detail-type": "EventStored",
    "detail": {
      "streamId": "stream-123",
      "eventNumber": 1,
      "eventType": "UserCreated",
      "eventData": {...},
      "eventMetadata": {...}
    }
  }
  ```

### 3. Library Functions (cfb-event-sourcing package)

**Purpose**: Provide reusable library functions for event sourcing operations that can be used by business capabilities in their Lambda functions.

**Location**: `cfb-event-sourcing/src/`

#### 3.1 Event Store Module
**File**: `cfb-event-sourcing/src/event-store.js`

**Functions**:
- `appendEvent(streamId, eventType, eventData, expectedVersion, config)`
  - Validates expected version matches current stream version
  - Appends event to EventStore (transaction)
  - Returns the new event with event number
  - Throws error if version mismatch (for caller to handle as 409 Conflict)

- `readEvents(streamId, fromEventNumber = 0, config)`
  - Reads events from EventStore for a stream
  - Returns events array
  - Idempotent (no side effects, safe to retry)

- `getStreamVersion(streamId, config)`
  - Gets current version (max event_number) for a stream
  - Returns 0 if stream doesn't exist

**Configuration**: Each function accepts a `config` object with:
- Database connection details (cluster ARN, secret ARN, database name)
- AWS region
- RDS Data API client (optional, can be created internally)

#### 3.2 Event Bus Module
**File**: `cfb-event-sourcing/src/event-bus.js`

**Functions**:
- `publishEvent(eventDetail, config)`
  - Publishes event to EventBridge
  - Returns promise that resolves when event is published

**Configuration**: Accepts `config` with:
- Event bus name
- AWS region
- EventBridge client (optional)

#### 3.3 Projection Module
**File**: `cfb-event-sourcing/src/projection.js`

**Functions**:
- `updateProjection(streamId, projectionType, projectionData, expectedVersion, config)`
  - Updates DynamoDB projection with optimistic locking
  - Uses conditional update (checks version matches)
  - Throws error if version conflict (for caller to retry)

- `getProjection(streamId, projectionType, config)`
  - Gets projection from DynamoDB
  - Returns projection data and version

- `replayEventsForProjection(streamId, eventStoreConfig)`
  - Replays all events for a stream
  - Helper function for projection listeners

**Configuration**: Accepts `config` with:
- DynamoDB table name
- AWS region
- DynamoDB client (optional)

**Optimistic Locking for Projections**:
- DynamoDB projection table includes `version` attribute
- On update, check `version` matches expected
- If mismatch, throws error (caller handles retry)
- Uses DynamoDB conditional updates (`ConditionExpression`)

### 4. DynamoDB Projection Table

**Purpose**: Store read-optimized projections

**Schema**:
```typescript
{
  streamId: string (partition key),
  projectionType: string (sort key),
  data: map (projection data),
  version: number (last processed event number),
  updatedAt: timestamp
}
```

**Key Features**:
- Composite key: `(streamId, projectionType)`
- `version` attribute for optimistic locking
- Conditional updates using `version`

## Implementation Steps

### Phase 1: Infrastructure (CDK)

#### Step 1.1: Create EventStore Resources
**File**: `cdk/lib/event-sourcing-resources.ts`

**Resources**:
- Aurora PostgreSQL Serverless v2 cluster
- Database instance (db.t4g.medium initially)
- VPC and security groups (or use default VPC for simplicity)
- Database proxy (for connection pooling)
- Secrets Manager for database credentials

**CDK Constructs**:
```typescript
- rds.DatabaseCluster (Aurora PostgreSQL Serverless v2)
- rds.DatabaseProxy
- secretsmanager.Secret
- ec2.Vpc (or use default)
- ec2.SecurityGroup
```

#### Step 1.2: Create EventBridge Resources
**File**: `cdk/lib/event-sourcing-resources.ts`

**Resources**:
- Custom EventBridge event bus: `codefreeze-event-bus`
- Event rules (initially empty, can add filters later)

**CDK Constructs**:
```typescript
- events.EventBus
```

#### Step 1.3: Create DynamoDB Projection Table
**File**: `cdk/lib/event-sourcing-resources.ts`

**Resources**:
- DynamoDB table for projections
- GSI (Global Secondary Index) for queries (if needed in the future)

**Note**: GSI stands for Global Secondary Index - a DynamoDB feature that allows querying a table by a different partition/sort key combination. Not needed for MVP since we'll query projections by `(streamId, projectionType)` which is the primary key.

**CDK Constructs**:
```typescript
- dynamodb.Table
- dynamodb.AttributeType
```

#### Step 1.4: Infrastructure Outputs and Permissions
**File**: `cdk/lib/event-sourcing-resources.ts`

**Note**: This capability does NOT create Lambda functions. Instead, it provides:
1. Infrastructure resources (Aurora, EventBridge, DynamoDB)
2. CDK construct that exposes these resources
3. IAM role/policy helpers that business capabilities can use to grant permissions to their Lambda functions

**CDK Construct Properties**:
```typescript
export class EventSourcingResources extends Construct {
    public readonly eventStoreCluster: rds.DatabaseCluster;
    public readonly eventStoreSecret: secretsmanager.Secret;
    public readonly eventBus: events.EventBus;
    public readonly projectionTable: dynamodb.Table;
    
    // Helper methods for granting permissions to Lambda functions
    public grantEventStoreAccess(lambdaFunction: lambda.Function): void;
    public grantEventBusPublishAccess(lambdaFunction: lambda.Function): void;
    public grantProjectionTableAccess(lambdaFunction: lambda.Function): void;
}
```

**Resources Exposed**:
- EventStore cluster ARN and secret ARN (for library functions)
- EventBus name (for library functions)
- DynamoDB table name (for library functions)
- Helper methods to grant permissions to Lambda functions from business capabilities

#### Step 1.5: Database Initialization
**File**: `cdk/lib/event-sourcing-resources.ts` or separate migration script

**Resources**:
- Lambda function for database schema initialization
- Or use RDS Data API with initial schema
- Or manual migration script

**Consideration**: For simplicity, use a separate migration Lambda or manual script

### Phase 2: Event Sourcing Library (`cfb-event-sourcing`)

**Purpose**: Create an NPM library package that provides reusable functions for event sourcing operations. Business capabilities will use these functions in their own Lambda handlers.

#### Step 2.1: Create Package Structure
```
cfb-event-sourcing/
├── package.json
├── index.js
├── src/
│   ├── event-store.js
│   ├── event-bus.js
│   ├── projection.js
│   └── config.js (utility for building config from environment)
├── test/
│   ├── event-store.test.js
│   ├── event-bus.test.js
│   ├── projection.test.js
│   └── integration.test.js
└── README.md
```

**Package Structure** (similar to `cfb-functional`):
- `index.js`: Exports public API
- `src/`: Implementation files
- `test/`: Unit and integration tests

#### Step 2.2: Event Store Module
**File**: `cfb-event-sourcing/src/event-store.js`

**Functions**:
- `appendEvent(streamId, eventType, eventData, expectedVersion, config)`
  - Gets current stream version using `getStreamVersion`
  - Validates `expectedVersion` matches current version + 1
  - If mismatch, throws `ConcurrencyError` (version conflict)
  - If match, inserts event with `event_number = expectedVersion`
  - Returns the appended event

- `readEvents(streamId, fromEventNumber = 0, config)`
  - Queries EventStore for events where `stream_id = streamId` and `event_number >= fromEventNumber`
  - Orders by `event_number` ascending
  - Returns array of events

- `getStreamVersion(streamId, config)`
  - Gets `MAX(event_number)` for the stream
  - Returns 0 if stream doesn't exist (no events)

**Database Connection**:
- Use RDS Data API (`@aws-sdk/client-rds-data`)
- Serverless-friendly, no connection pooling needed
- Requires cluster ARN, secret ARN, database name

**Configuration**:
```javascript
{
  clusterArn: string,
  secretArn: string,
  databaseName: string,
  region: string,
  rdsDataClient?: RDSDataClient  // optional, can be created internally
}
```

#### Step 2.3: Event Bus Module
**File**: `cfb-event-sourcing/src/event-bus.js`

**Functions**:
- `publishEvent(eventDetail, config)`
  - Publishes event to EventBridge custom event bus
  - Event format matches the structure defined in Component 2
  - Returns promise

**Configuration**:
```javascript
{
  eventBusName: string,
  region: string,
  eventBridgeClient?: EventBridgeClient  // optional
}
```

#### Step 2.4: Projection Module
**File**: `cfb-event-sourcing/src/projection.js`

**Functions**:
- `updateProjection(streamId, projectionType, projectionData, expectedVersion, config)`
  - Updates DynamoDB projection using conditional update
  - Condition: `version = expectedVersion`
  - Throws `ConcurrencyError` if condition fails (for caller to retry)
  - Sets `updatedAt` timestamp

- `getProjection(streamId, projectionType, config)`
  - Gets projection from DynamoDB
  - Returns `{ data, version, updatedAt }` or `null` if not found

- `replayEventsForProjection(streamId, eventStoreConfig)`
  - Helper function that calls `readEvents(streamId, 0, eventStoreConfig)`
  - Returns all events for replay logic

**Configuration**:
```javascript
{
  tableName: string,
  region: string,
  dynamoDbClient?: DynamoDBClient  // optional
}
```

#### Step 2.5: Config Utility Module
**File**: `cfb-event-sourcing/src/config.js`

**Functions**:
- `createEventStoreConfigFromEnv()`
  - Reads environment variables and creates event store config
  - Environment variables: `EVENT_STORE_CLUSTER_ARN`, `EVENT_STORE_SECRET_ARN`, `EVENT_STORE_DB_NAME`, `AWS_REGION`

- `createEventBusConfigFromEnv()`
  - Reads environment variables and creates event bus config
  - Environment variables: `EVENT_BUS_NAME`, `AWS_REGION`

- `createProjectionConfigFromEnv()`
  - Reads environment variables and creates projection config
  - Environment variables: `PROJECTION_TABLE_NAME`, `AWS_REGION`

**Usage in Business Capabilities**:
Business capabilities can either:
1. Use the config utility functions (recommended for Lambda functions)
2. Create config objects manually (for testing or custom scenarios)

### Phase 3: CDK Integration

#### Step 3.1: Create Event Sourcing Construct
**File**: `cdk/lib/event-sourcing-resources.ts`

**Structure**:
```typescript
export class EventSourcingResources extends Construct {
    public readonly eventStoreCluster: rds.DatabaseCluster;
    public readonly eventStoreSecret: secretsmanager.Secret;
    public readonly eventBus: events.EventBus;
    public readonly projectionTable: dynamodb.Table;
    
    // Helper methods to grant permissions to Lambda functions
    public grantEventStoreAccess(lambdaFunction: lambda.Function): void;
    public grantEventBusPublishAccess(lambdaFunction: lambda.Function): void;
    public grantProjectionTableAccess(lambdaFunction: lambda.Function): void;
}
```

**Implementation**:
- Creates Aurora PostgreSQL cluster
- Creates Secrets Manager secret for DB credentials
- Creates EventBridge custom event bus
- Creates DynamoDB projection table
- Exposes grant methods for IAM permissions

**Grant Methods**:
- `grantEventStoreAccess`: Grants RDS Data API access and Secrets Manager read access
- `grantEventBusPublishAccess`: Grants EventBridge PutEvents permission
- `grantProjectionTableAccess`: Grants DynamoDB read/write access to projection table

#### Step 3.2: Integrate into Stack
**File**: `cdk/lib/codefreeze-board-stack.ts`

**Integration**:
- Import `EventSourcingResources`
- Create instance in stack: `const eventSourcing = new EventSourcingResources(this, 'EventSourcing', { ... })`
- Export outputs for resource names/ARNs (for environment variables in Lambda functions)
- Business capabilities can use `eventSourcing.grantXXXAccess(lambdaFunction)` to grant permissions

**Example Usage in Business Capability**:
```typescript
// In a business capability's CDK construct
const myLambda = new lambda.Function(...);
eventSourcing.grantEventStoreAccess(myLambda);
eventSourcing.grantEventBusPublishAccess(myLambda);

// Set environment variables
myLambda.addEnvironment('EVENT_STORE_CLUSTER_ARN', eventSourcing.eventStoreCluster.clusterArn);
myLambda.addEnvironment('EVENT_STORE_SECRET_ARN', eventSourcing.eventStoreSecret.secretArn);
// ... etc
```

#### Step 3.3: Database Schema Migration
**Approach Options**:
1. Separate migration Lambda (runs once on deploy)
2. Manual SQL script (run via CLI)
3. RDS Data API script

**Recommendation**: Start with manual SQL script for simplicity

**File**: `cdk/scripts/init-event-store.sql`

### Phase 4: Testing

#### Step 4.1: Unit Tests
- Event Store operations (mocked database)
- Event Bus publishing (mocked EventBridge)
- Handler functions (mocked dependencies)

#### Step 4.2: Integration Tests
- End-to-end: Append → Read → Projection
- Optimistic locking scenarios
- Error handling scenarios

## Detailed Implementation Checklist

### CDK Infrastructure
- [ ] Create `event-sourcing-resources.ts` construct
- [ ] Create Aurora PostgreSQL cluster (Serverless v2)
- [ ] Create Secrets Manager secret for DB credentials
- [ ] Create EventBridge custom event bus
- [ ] Create DynamoDB projection table
- [ ] Implement grant methods for Lambda permissions
- [ ] Create database initialization script/SQL
- [ ] Add outputs for resource ARNs/names
- [ ] Integrate EventSourcingResources into main stack
- [ ] Test deployment

### Event Sourcing Library (cfb-event-sourcing)
- [ ] Create `cfb-event-sourcing` package structure (library, not functions)
- [ ] Implement `event-store.js` module (appendEvent, readEvents, getStreamVersion)
- [ ] Implement `event-bus.js` module (publishEvent)
- [ ] Implement `projection.js` module (updateProjection, getProjection, replayEventsForProjection)
- [ ] Implement `config.js` utility module (create configs from environment variables)
- [ ] Create `index.js` to export public API
- [ ] Write unit tests for all modules (with mocks)
- [ ] Write integration tests (optional, requires deployed infrastructure)

### Usage in Business Capabilities
- [ ] Example: Create a business capability that uses the library
- [ ] Example: Lambda handler that appends events
- [ ] Example: Lambda handler that reads events
- [ ] Example: Lambda handler (EventBridge trigger) that updates projections
- [ ] Test optimistic locking (concurrent writes)
- [ ] Test projection optimistic locking (concurrent updates)

## Simplifications for MVP

1. **Database**: Use RDS Data API instead of connection pooling (simpler, serverless-friendly)
2. **VPC**: Use default VPC or public subnet initially (simpler setup)
3. **Migration**: Manual SQL script instead of automated migration
4. **Projection**: Simple counter/aggregate projection (e.g., event count)
5. **Error Handling**: Basic retry logic (exponential backoff, max 3 retries)
6. **Monitoring**: Basic CloudWatch logs (add metrics/alarms later)

## Future Enhancements (Post-MVP)

1. **Connection Pooling**: RDS Proxy for better performance
2. **VPC**: Proper VPC setup with private subnets
3. **Multi-Region**: Cross-region replication
4. **Event Snapshots**: Periodic snapshots for faster replay
5. **Multiple Projections**: Support multiple projection types
6. **Event Versioning**: Schema evolution support
7. **Monitoring**: CloudWatch metrics, alarms, dashboards
8. **Event Archiving**: Move old events to S3/Glacier

## AWS Resource Choices Rationale

1. **Aurora PostgreSQL Serverless v2**: 
   - Optimized for append-only workloads
   - Auto-scaling
   - Fast reads with indexes
   - PostgreSQL JSONB support

2. **EventBridge** (vs DynamoDB Streams):
   - Better for event sourcing patterns
   - Decoupled architecture
   - Built-in filtering and routing
   - Multiple subscribers possible
   - Better for cross-service events

3. **DynamoDB for Projections**:
   - Fast read/write for projections
   - Conditional updates (optimistic locking)
   - Serverless (pay per use)
   - Good for key-value projections

4. **RDS Data API** (initially):
   - No connection management
   - Serverless-friendly
   - Simpler than connection pooling
   - Good for Lambda

## Environment Variables Needed

**For Lambda Functions using the library**:
- `EVENT_STORE_CLUSTER_ARN` - RDS cluster ARN (from CDK construct)
- `EVENT_STORE_SECRET_ARN` - Secrets Manager ARN (from CDK construct)
- `EVENT_STORE_DB_NAME` - Database name (e.g., "eventstore")
- `EVENT_BUS_NAME` - EventBridge bus name (from CDK construct)
- `PROJECTION_TABLE_NAME` - DynamoDB table name (from CDK construct)
- `AWS_REGION` - AWS region (usually available in Lambda runtime)

**Usage in Business Capability Lambda**:
```javascript
import { appendEvent, publishEvent, createEventStoreConfigFromEnv, createEventBusConfigFromEnv } from '@rinkkasatiainen/cfb_-event-sourcing-first-draft';

export const handler = async (event) => {
  const eventStoreConfig = createEventStoreConfigFromEnv();
  const eventBusConfig = createEventBusConfigFromEnv();
  
  try {
    const appendedEvent = await appendEvent(
      event.streamId,
      event.eventType,
      event.eventData,
      event.expectedVersion,
      eventStoreConfig
    );
    
    await publishEvent({
      streamId: appendedEvent.streamId,
      eventNumber: appendedEvent.eventNumber,
      eventType: appendedEvent.eventType,
      eventData: appendedEvent.eventData,
      eventMetadata: appendedEvent.eventMetadata
    }, eventBusConfig);
    
    return { statusCode: 200, body: JSON.stringify(appendedEvent) };
  } catch (error) {
    if (error.name === 'ConcurrencyError') {
      return { statusCode: 409, body: JSON.stringify({ error: 'Version conflict' }) };
    }
    throw error;
  }
};
```

## Security Considerations

1. **Database Access**: 
   - Use Secrets Manager for credentials
   - Lambda functions only (no public access)
   - Security groups restrict access

2. **API Gateway**: 
   - Add authentication (Cognito) in future
   - Rate limiting
   - CORS configuration

3. **EventBridge**: 
   - Resource-based policies
   - Event source verification

4. **DynamoDB**: 
   - IAM policies for table access
   - Encryption at rest

## Cost Estimation (Development)

- **Aurora Serverless v2** (db.t4g.medium): ~$50-100/month
- **RDS Proxy**: ~$15/month
- **EventBridge**: ~$1 per million events
- **DynamoDB**: Pay per request (very low for dev)
- **Lambda**: Pay per invocation (very low for dev)
- **API Gateway**: Pay per request (very low for dev)

**Estimated Monthly Cost**: ~$70-120/month for development workload

