# Range Alert Rule: Anomalous Tx Volume

## Description

`AnomalousTxVolume` is triggered when a contract is called too many times in a specified duration. The transaction count in this interval is compared with a threshold specified inside parameters.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> Anomaly detected in transactions for contract osmo123...

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=anomalous-tx-volume npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
