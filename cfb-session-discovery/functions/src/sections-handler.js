import { codefreeze2025 } from '../contracts/section-entry.js'

/**
 * AWS Lambda handler for retrieving section entries
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} API Gateway response
 */
export const handler = async (event, context) => {
  try {
    // Set CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
    }

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      }
    }

    // Handle GET request
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          sections: codefreeze2025,
          eventId: 'codefreeze2025',
        }),
      }
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  } catch (error) {
    console.error('Error in sections handler:', error)

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    }
  }
}
