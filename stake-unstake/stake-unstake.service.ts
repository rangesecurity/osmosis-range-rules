import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
  Osmosis1TrxMsgCosmosStakingV1beta1MsgDelegate,
  Osmosis1TrxMsgCosmosStakingV1beta1MsgUndelegate,
} from '@range-security/range-sdk';

@Injectable()
export class StakeUnstakeService implements OnBlock {
  private readonly INFO_THRESHOLD = 1_000_000_000_000;
  private readonly HIGH_THRESHOLD = 5_000_000_000_000;

  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const delegateHighMessages: Osmosis1TrxMsgCosmosStakingV1beta1MsgDelegate[] =
      [];
    const delegateInfoMessages: Osmosis1TrxMsgCosmosStakingV1beta1MsgDelegate[] =
      [];
    const undelegateHighMessages: Osmosis1TrxMsgCosmosStakingV1beta1MsgUndelegate[] =
      [];
    const undelegateInfoMessages: Osmosis1TrxMsgCosmosStakingV1beta1MsgUndelegate[] =
      [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (msg.type === Osmosis1TrxMsgTypes.CosmosStakingV1beta1MsgDelegate) {
          const { data } = msg;
          const amount = BigInt(data.amount.amount);
          if (amount >= this.HIGH_THRESHOLD) {
            delegateHighMessages.push(msg);
          } else if (amount >= this.INFO_THRESHOLD) {
            delegateInfoMessages.push(msg);
          }
        }

        if (
          msg.type === Osmosis1TrxMsgTypes.CosmosStakingV1beta1MsgUndelegate
        ) {
          const { data } = msg;
          const amount = BigInt(data.amount.amount);
          if (amount >= this.HIGH_THRESHOLD) {
            undelegateHighMessages.push(msg);
          } else if (amount >= this.INFO_THRESHOLD) {
            undelegateInfoMessages.push(msg);
          }
        }
      }
    }

    const results: ISubEvent[] = [
      ...delegateHighMessages.map((m) => ({
        details: {
          message: `A huge amount delegate action of ${JSON.stringify(
            m.data.amount.amount,
          )} has been performed by ${m.data.delegatorAddress}`,
        },
        txHash: m.tx_hash,
        addressesInvolved: m.addresses,
        severity: 'low',
        caption: 'Sensitive stake/unstake event',
      })),
      ...delegateInfoMessages.map((m) => ({
        details: {
          message: `A high amount delegate action of ${JSON.stringify(
            m.data.amount.amount,
          )} has been performed by ${m.data.delegatorAddress}`,
        },
        txHash: m.tx_hash,
        addressesInvolved: m.addresses,
        severity: 'high',
        caption: 'Sensitive stake/unstake event',
      })),
      ...undelegateHighMessages.map((m) => ({
        details: {
          message: `A huge amount undelegate action of ${m.data.amount.amount} has been performed by ${m.data.delegatorAddress}`,
        },
        txHash: m.tx_hash,
        addressesInvolved: m.addresses,
        severity: 'low',
        caption: 'Sensitive stake/unstake event',
      })),
      ...undelegateInfoMessages.map((m) => ({
        details: {
          message: `A high amount undelegate action of ${m.data.amount.amount} has been performed by ${m.data.delegatorAddress}`,
        },
        txHash: m.tx_hash,
        addressesInvolved: m.addresses,
        severity: 'info',
        caption: 'Sensitive stake/unstake event',
      })),
    ];

    return results;
  };
}
