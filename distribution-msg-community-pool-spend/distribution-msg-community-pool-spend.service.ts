import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';

@Injectable()
export class DistributionMsgCommunityPoolSpendService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (
          msg.type ===
          Osmosis1TrxMsgTypes.CosmosDistributionV1beta1MsgCommunityPoolSpend
        ) {
          alerts.push({
            txHash: msg.tx_hash,
            details: {
              message: `Funds of ${JSON.stringify(
                msg.data.amount,
              )} have been spent from the community pool. The recipient of the funds is ${
                msg.data.recipient
              }. The signer of the transaction is authority ${
                msg.data.authority
              }`,
            },
            addressesInvolved: msg.addresses,
            severity: 'info',
            caption: 'Community pool funds spent',
          });
        }
      }
    }

    return alerts;
  };
}
