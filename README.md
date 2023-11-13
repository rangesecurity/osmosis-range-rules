# Osmosis Range detection rules
This repository contains the public and open-source set of rules built and run by Range for the Osmosis network. All detector rules are built with the [Range SDK](https://github.com/rangesecurity/range-sdk).

## Rule List
- **anomalous-tx-volume:** Rule to detect if there are anomalies in the number of times a contract is called
- **auth-msg-update-params:** Rule that triggers if the parameters of the `auth` module are changed
- **authz-abuse:** Rule that may detect phishing attacks by anomalies on the usage of `authz` grant messages
- **contract-admin-update:** Rule that triggers when the admin of a contract is updated
- **contract-instantiation:** Rule that triggers if a contract with a given `code-id` is instantiated
- **distribution-msg-community-pool-spend:** Rule that triggers if funds from the community pool are spent
- **distribution-msg-fund-community-pool:** Rule that triggers if the community pool is funded
- **ibc-addr-txs:** Rule that detects if a specific address performs more than `x` transaction over a time window `t`
- **ibc-channel-avg-pending-tx:** Rule that detects if there are more pending IBC transfers than usual
- **ibc-channel-failed-tx:** Rule that detects if there are more failed IBC transfers than usual
- **ibc-channel-failed-tx-perc:** Rule that triggers if the ratio of failed IBC transfers for a specific channel is higher than usual
- **ibc-channel-flow-quota-x:** Rule that triggers if more than `x` % of a ibc rate limit quota is surpassed
- **ibc-channel-num-txs:** Rule that triggers with there are more IBC transfers in a channel than a threshold
- **ibc-channel-pending-tx:** Rule that triggers if there are more IBC pending txs in a channel than a threshold
- **incentive-gauge-created:** Rule that triggers if an incentive gauge is created
- **large-stake:** Rule that triggers when a large amount is staked to a validator
- **large-unstake:** Rule that triggers when a large amount is unstaked from a validator
- **more-than-x-txs-in-last-hour:** Rule that triggers when the number of transactions by an address passes above a threshold
- **new-contract-code-stored:** Rule that triggers when a new CosmWasm contract code is stored
- **new-pool-created:** Rule that triggers when a new liquidity pool is created
- **new-validator-created:** Rule that triggers when a new validator is created
- **relayer-low-on-funds:** Rule that detects when the balance of a relayer goes below a certain threshold
- **slashing-msg-unjail:** Rule that triggers when a validator is unjailed
- **slashing-msg-update-params:** Rule that triggers when the parameters of the `slashing` module are updated
- **staking-msg-update-params:** Rule that triggers when the parameters of the `staking` module are updated
- **token-factory-burn:** Rule that triggers when tokens of a specific denom are burned
- **token-factory-change-admin:** Rule that triggers then the admin of a `tokenfactory` token are updated
- **token-factory-create-denom:** Rule that triggers when a new `tokenfactory` denom is created
- **token-factory-mint:** Rule that triggers when tokens of a specific denom are minted
- **token-factory-set-denom-metadata:** Rule that triggers when the metadata of a specific denom is updated
- **unusual-high-gas-usage:** Rule that detects when unusual high gas usage is detected for a message type
- **upgrade-msg-cancel-upgrade:** Rule that triggers when a network software upgrade is cancelled
- **upgrade-msg-software-upgrade:** Rule that triggers when a software upgrade is performed

- ## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](link) file for details.
