# Range Alert Rule: Slashing Msg Unjail

## Description

`CosmosSlashingV1beta1MsgUnjail` is triggered when a validator is unjailed.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> Validator cosmosvaloper1yh089p0cre4nhpdqw35uzde5amg3qzexkeggdn has been unjailed after a slash event

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=slashing-msg-unjail npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
