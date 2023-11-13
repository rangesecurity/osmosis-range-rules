# Range Alert Rule: Relayer Low On Funds

## Description

`RelayerLowOnFunds` is triggered when the balance of a relayer goes below a certain threshold.

## API for creating this rule

```typescript
interface IParameters {
  relayer: string;
  threshold: number;
}
```

## Sample alert events

> Relayer address osmo123... is running low of funds.

## Severity

- **Low**

## Development

After setting the env variables, you can run tests using `RULE=relayer-low-on-funds npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
