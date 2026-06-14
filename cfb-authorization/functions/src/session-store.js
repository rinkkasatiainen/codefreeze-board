import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'

const PKCE_PREFIX = 'PKCE#'
const SESSION_PREFIX = 'SESSION#'

let docClient

function getDocClient() {
  if (!docClient) {
    docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
  }
  return docClient
}

function tableName() {
  const name = process.env.SESSIONS_TABLE_NAME
  if (!name) {
    throw new Error('SESSIONS_TABLE_NAME is not configured')
  }
  return name
}

export async function savePkceState(state, { codeVerifier, returnTo, expiresAt }) {
  await getDocClient().send(new PutCommand({
    TableName: tableName(),
    Item: {
      pk: `${PKCE_PREFIX}${state}`,
      codeVerifier,
      returnTo,
      expiresAt,
    },
  }))
}

export async function consumePkceState(state) {
  const pk = `${PKCE_PREFIX}${state}`
  const result = await getDocClient().send(new GetCommand({
    TableName: tableName(),
    Key: { pk },
  }))
  if (!result.Item) {
    return null
  }
  await getDocClient().send(new DeleteCommand({
    TableName: tableName(),
    Key: { pk },
  }))
  return result.Item
}

export async function saveSession(sessionId, session, expiresAt) {
  await getDocClient().send(new PutCommand({
    TableName: tableName(),
    Item: {
      pk: `${SESSION_PREFIX}${sessionId}`,
      ...session,
      expiresAt,
    },
  }))
}

export async function getSession(sessionId) {
  const result = await getDocClient().send(new GetCommand({
    TableName: tableName(),
    Key: { pk: `${SESSION_PREFIX}${sessionId}` },
  }))
  return result.Item || null
}

export async function deleteSession(sessionId) {
  await getDocClient().send(new DeleteCommand({
    TableName: tableName(),
    Key: { pk: `${SESSION_PREFIX}${sessionId}` },
  }))
}
