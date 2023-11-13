# Range Alert Rule: Staking Msg Update Params

## Description

`CosmosStakingV1beta1MsgUpdateParams` is triggered when the staking module parameters are updated.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> The parameters for the Staking module has been updated by authority address osmo123... Current parameters: {...}

## Severity

- **Info**

## Development

After setting the env variables, you can run tests using `RULE=staking-msg-update-params npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
