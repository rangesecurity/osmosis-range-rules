# Range Alert Rule: Large Unstake

## Description

`LargeUnstake` is triggered when a large amount is unstaked from a validator.
The unstaked amount determined the severity of the alert event.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> A huge amount undelegate action of "5000000000000" has been performed by osmo1cyql4zulfc4gv5ss5j2fsvupzvgmc6dwdgycsz

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=large-unstake npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
