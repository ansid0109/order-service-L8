'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.decorate('sendOrder', async function (orderPayload) {
    const targetUrl = process.env.ORDER_TARGET_URL

    if (!targetUrl) {
      throw new Error('ORDER_TARGET_URL is not set')
    }

    const timeoutMs = Number(process.env.ORDER_TARGET_TIMEOUT_MS || 5000)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(orderPayload),
        signal: controller.signal
      })

      if (!response.ok) {
        const responseBody = await response.text()
        throw new Error(`Downstream POST failed with status ${response.status}: ${responseBody}`)
      }
    } finally {
      clearTimeout(timeout)
    }
  })
})
