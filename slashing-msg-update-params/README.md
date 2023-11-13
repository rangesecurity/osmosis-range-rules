# Range Alert Rule: Slashing Msg Update Params

## Description

`CosmosSlashingV1beta1MsgUnjail` is triggered when slashing module parameters are updated.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> The parameters for the Slashing module have been updated by authority address osmo123... Current parameters: {...}

## Severity

- **Info**

## Development

After setting the env variables, you can run tests using `RULE=slashing-msg-update-params npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
