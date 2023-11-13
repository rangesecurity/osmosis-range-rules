# Range Alert Rule: Contract Instantiation

## Description

`CosmwasmWasmV1MsgInstantiateContract` is triggered when a contract with certain code ids is instantiation by a user. These code ids are specified inside rule parameters. If the code ids is set as empty array(`[]`), alerts will be triggered for all contract instantiations.

## API for creating this rule

```typescript
interface IParameters {
  code_ids: string[];
}
```

## Sample alert events

> Cosmwasm contract instantiated for code id: 40

## Severity

- **Low**

## Development

After setting the env variables, you can run tests using `RULE=contract-instantiation npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
