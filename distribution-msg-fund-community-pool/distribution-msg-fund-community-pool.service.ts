import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';

@Injectable()
export class DistributionMsgFundCommunityPoolService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (
          msg.type ===
          Osmosis1TrxMsgTypes.CosmosDistributionV1beta1MsgFundCommunityPool
        ) {
          alerts.push({
            txHash: msg.tx_hash,
            details: {
              message: `The community pool has been funded by address ${msg.data.depositor} with an amount of ${msg.data.amount[0].amount} ${msg.data.amount[0].denom}`,
            },
            addressesInvolved: msg.addresses,
            severity: 'info',
            caption: 'Community pool funded',
          });
        }
      }
    }

    return alerts;
  };
}
