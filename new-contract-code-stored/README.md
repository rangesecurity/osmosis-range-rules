# Range Alert Rule: New Contract Code Stored

## Description

`CosmwasmWasmV1MsgStoreCode` is triggered when a new contract code is stored in cosmwasm module

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> New CW contract code stored by osmo1ed6ezqx9t4e9sfm6nfgulq3005umrh6hkclagk

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=contract-instantiation npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
