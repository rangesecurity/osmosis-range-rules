import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsg,
  Osmosis1TrxMsgTypes,
  Osmosis1TrxMsgCosmosStakingV1beta1MsgUndelegate,
} from '@range-security/range-sdk';

const INFO_THRESHOLD = 1_000_000_000_000;
const HIGH_THRESHOLD = 5_000_000_000_000;

@Injectable()
export class LargeUnstakeService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const allMessages: Osmosis1TrxMsg[] = block.transactions.flatMap(
      (tx) => tx.messages,
    );

    const undelegateHighMessages: Osmosis1TrxMsgCosmosStakingV1beta1MsgUndelegate[] =
      [];
    const undelegateInfoMessages: Osmosis1TrxMsgCosmosStakingV1beta1MsgUndelegate[] =
      [];
    allMessages.forEach((m: Osmosis1TrxMsg) => {
      if (m.type === Osmosis1TrxMsgTypes.CosmosStakingV1beta1MsgUndelegate) {
        const { data } = m;
        const amount = BigInt(data.amount.amount);
        if (amount >= HIGH_THRESHOLD) {
          undelegateHighMessages.push(m);
        } else if (amount >= INFO_THRESHOLD) {
          undelegateInfoMessages.push(m);
        }
      }
    });

    const results = [
      ...undelegateHighMessages.map((m) => ({
        details: {
          message: `A huge amount undelegate action of ${m.data.amount.amount} has been performed by ${m.data.delegatorAddress}`,
        },
        txHash: m.tx_hash,
        addressesInvolved: m.addresses,
        caption: 'Sensitive unstake event',
      })),
      ...undelegateInfoMessages.map((m) => ({
        details: {
          message: `A high amount undelegate action of ${m.data.amount.amount} has been performed by ${m.data.delegatorAddress}`,
        },
        txHash: m.tx_hash,
        addressesInvolved: m.addresses,
        caption: 'Sensitive unstake event',
      })),
    ];

    return results;
  };
}
