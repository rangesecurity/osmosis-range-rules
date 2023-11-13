# Range Alert Rule: IBC Channel Flow Quota X

## Description

`IBCChannelFlowQuotaX` is triggered when rate limit is reached for a specific denom in a channel.

## API for creating this rule

```typescript
interface IParameters {
  contract: string;
  queryObj: object;
  quotaName: string;
  percentage: number;
}
```

## Sample alert events

> 50% limit has been reached for inflow of quota STARS-DAY-1

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=ibc-channel-flow-quota-x npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
