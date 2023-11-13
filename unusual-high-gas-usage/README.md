# Range Alert Rule: Unusual High Gas Usage

## Description

`UnusualHighGasUsage` is triggered when unusual high gas usage is detected for a message type.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> Unusual high gas usage detected

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=unusual-high-gas-usage npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
