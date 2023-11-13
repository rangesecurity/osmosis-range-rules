# Range Alert Rule: Incentive Gauge

## Description

`OsmosisIncentivesMsgCreateGauge` is triggered when a new incentive gauge is created.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> A new incentives gauge has been created with start time 2023-09-30T08:57:26.226Z

## Severity

- **Info**

## Development

After setting the env variables, you can run tests using `RULE=incentive-gauge-created npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
