'use strict'

const fp = require('fastify-plugin')

function toNonNegativeInteger (value, fallback) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback
  }

  return Math.floor(parsed)
}

function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = fp(async function (fastify, opts) {
  fastify.decorate('sendOrder', async function (orderPayload) {
    const targetUrl = process.env.ORDER_TARGET_URL

    if (!targetUrl) {
      throw new Error('ORDER_TARGET_URL is not set')
    }

    const timeoutMs = toNonNegativeInteger(process.env.ORDER_TARGET_TIMEOUT_MS, 5000)
    const maxRetries = toNonNegativeInteger(process.env.ORDER_TARGET_MAX_RETRIES, 2)
    const retryBaseMs = toNonNegativeInteger(process.env.ORDER_TARGET_RETRY_BASE_MS, 200)
    const maxBackoffMs = 5000
    const retryableStatuses = new Set([429, 502, 503, 504])
    const maxAttempts = maxRetries + 1

    let lastError

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      let shouldRetry = false

      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(orderPayload),
          signal: controller.signal
        })

        if (response.ok) {
          return
        }

        const responseBody = await response.text()
        lastError = new Error(`Downstream POST failed with status ${response.status}: ${responseBody}`)
        shouldRetry = retryableStatuses.has(response.status)

        if (!shouldRetry) {
          throw lastError
        }
      } catch (error) {
        const isAbortError = error && error.name === 'AbortError'
        const isNetworkError = error instanceof TypeError

        if (!lastError) {
          lastError = error
        }

        if (isAbortError || isNetworkError) {
          shouldRetry = true
        } else {
          throw error
        }
      } finally {
        clearTimeout(timeout)
      }

      if (!shouldRetry || attempt === maxAttempts) {
        throw lastError
      }

      const backoffMs = Math.min(retryBaseMs * Math.pow(2, attempt - 1), maxBackoffMs)
      await delay(backoffMs)
    }
  })
})
