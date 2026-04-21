# order-service

This is a Fastify app that provides an API for submitting orders. It is meant to be used in conjunction with the store-front app.

It is a simple REST API that accepts orders and forwards them to another service using an HTTP POST request.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/)

## Configuration

Set the following environment variables before starting the app:

- `ORDER_TARGET_URL` (required): Full URL of the downstream endpoint that receives orders.
- `ORDER_TARGET_TIMEOUT_MS` (optional): Request timeout in milliseconds. Defaults to `5000`.

Example:

```bash
cat << EOF > .env
ORDER_TARGET_URL=http://localhost:3001/orders
ORDER_TARGET_TIMEOUT_MS=5000
EOF

source .env
```

## Running the app locally

To run the app, run the following command:

```bash
npm install
npm run dev
```

When the app is running, you should see output similar to the following:

```text
> order-service@1.0.0 dev
> fastify start -w -l info -P app.js

[1687920999327] INFO (108877 on yubuntu): Server listening at http://[::1]:3000
[1687920999327] INFO (108877 on yubuntu): Server listening at http://127.0.0.1:3000
```

## Testing the API

Using the [`test-order-service.http`](./test-order-service.http) file in the root of the repo, you can test the API. However, you will need to use VS Code and have the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension installed.