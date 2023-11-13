# Range Alert Rule: Distribution Msg Community Pool Spend

## Description

`CosmosDistributionV1beta1MsgCommunityPoolSpend` is triggered when a spending is made from community pool by an authority.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> Funds of {...} have been spent from the community pool. The recipient of the funds is osmo123... . The signer of the transaction is authority osmo123...

## Severity

- **Info**

## Development

After setting the env variables, you can run tests using `RULE=distribution-msg-community-pool-spend npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
