import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';

@Injectable()
export class TokenFactoryCreateDenomService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (
          msg.type ===
          Osmosis1TrxMsgTypes.OsmosisTokenFactoryV1beta1MsgCreateDenom
        ) {
          alerts.push({
            txHash: msg.tx_hash,
            details: {
              message: `A new token denom has been created with name ${msg.data.subdenom} by ${msg.data.sender}`,
            },
            addressesInvolved: msg.addresses,
            severity: 'low',
            caption: 'New token denom created in Token Factory',
          });
        }
      }
    }

    return alerts;
  };
}
