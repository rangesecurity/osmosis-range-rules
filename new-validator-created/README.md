# Range Alert Rule: New Validator Created

## Description

`MsgCreateValidator` is triggered when a new validator is created.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> A new validator is created with validator address: osmo123... by osmo123...

## Severity

- **Info**

## Development

After setting the env variables, you can run tests using `RULE=new-validator-created npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
