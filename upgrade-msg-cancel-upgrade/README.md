# Range Alert Rule: Upgrade Msg Cancel Upgrade

## Description

`CosmosUpgradeV1beta1MsgCancelUpgrade` is triggered when a network software upgrade is cancelled.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> A network software upgrade has been cancelled by authority address osmo123...

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=upgrade-msg-cancel-upgrade npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
