# Range Alert Rule: Contract Admin Update

## Description

`CosmwasmWasmV1MsgUpdateAdmin` is triggered when the admin of a contract is updated.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> Cosmwasm contract admin updated to osmo123... by osmo123... for contract osmo123...

## Severity

- **High**

## Development

After setting the env variables, you can run tests using `RULE=contract-admin-update npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
