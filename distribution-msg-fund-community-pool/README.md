# Range Alert Rule: Distribution Msg Community Fund Pool

## Description

`CosmosDistributionV1beta1MsgFundCommunityPool` is triggered when the community pool is funded by an address.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> The community pool has been funded by address osmo123... with an amount of 100 OSMO

## Severity

- **Info**

## Development

After setting the env variables, you can run tests using `RULE=distribution-msg-fund-community npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
