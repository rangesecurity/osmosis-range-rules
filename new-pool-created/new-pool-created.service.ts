import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsg,
  Osmosis1TrxMsgTypes,
  Osmosis1TrxMsgOsmosisGammPoolModelsBalancerV1beta1MsgCreateBalancerPool,
  Osmosis1TrxMsgOsmosisGammPoolModelsStableSwapV1beta1MsgCreateStableSwapPool,
} from '@range-security/range-sdk';

const MESSAGE_TYPES = [
  Osmosis1TrxMsgTypes.OsmosisGammPoolModelsBalancerV1beta1MsgCreateBalancerPool,
  Osmosis1TrxMsgTypes.OsmosisGammPoolModelsStableSwapV1beta1MsgCreateStableSwapPool,
];
@Injectable()
export class NewPoolCreatedService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block, rule) => {
    const allMessages: Osmosis1TrxMsg[] = block.transactions.flatMap(
      (tx) => tx.messages,
    );
    const targetMessages = allMessages.filter((m) => {
      return MESSAGE_TYPES.includes(m.type);
    }) as (
      | Osmosis1TrxMsgOsmosisGammPoolModelsBalancerV1beta1MsgCreateBalancerPool
      | Osmosis1TrxMsgOsmosisGammPoolModelsStableSwapV1beta1MsgCreateStableSwapPool
    )[];

    const caption =
      rule.ruleType === 'CreateBalancerPool'
        ? 'New balancer-style pool created'
        : 'New Stableswap pool created';
    const results: ISubEvent[] = targetMessages.map((m) => ({
      details: {
        message: `A new pool is created.`,
      },
      txHash: m.tx_hash,
      addressesInvolved: m.addresses,
      caption: caption,
    }));

    return results;
  };
}
