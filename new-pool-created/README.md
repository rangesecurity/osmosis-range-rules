# Range Alert Rule: New Pool Created

## Description

`CreateBalancerPool` or `CreateStableswapPool` is triggered when a new liquidity pool is created.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> A new pool is created.

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=new-pool-created npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
