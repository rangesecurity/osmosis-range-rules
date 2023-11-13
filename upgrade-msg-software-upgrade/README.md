# Range Alert Rule: Upgrade Msg Software Upgrade

## Description

`contract-instantiation` is triggered when a contract with certain codeIds is instantiation by a user.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> A network software upgrade has been initialized by authority address osmo123... The upgrade plan is the following: {...}

## Severity

- **Info**

## Development

After setting the env variables, you can run tests using `RULE=upgrade-msg-software-upgrade npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
