# Range Alert Rule: IBC Channel Pending Tx

## Description

`IBCChannelPendingTx` is triggered when the number of transactions across a channel goes above a threshold within a specified time window.

This rule will only be processed only in a specified block interval `blockWindow`.`blockWidth` is the number of blocks that are fetched for processing.

## API for creating this rule

```typescript
interface IParameters {
  channelId: string;
  threshold: number;
  blockWidth: number;
  blockWindow: number;
}
```

## Sample alert events

> The number of pending transactions in channel channel-0 is 2 which is above the threshold of 1 in last 500 blocks.

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=ibc-channel-pending-tx npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
