# Range Alert Rule: Auth Msg Update Params

## Description

`CosmosAuthV1beta1MsgUpdateParams` is triggered when the parameters in auth module are updated.

## API for creating this rule

```typescript
interface IParameters {}
```

## Sample alert events

> The parameters for the Auth module has been updated by authority address {...}. Current parameters: {...}

## Severity

- **Info**

## Development

After setting the env variables, you can run tests using `RULE=auth-msg-update-params npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
