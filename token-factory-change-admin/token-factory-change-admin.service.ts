import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';

@Injectable()
export class TokenFactoryChangeAdminService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (
          msg.type ===
          Osmosis1TrxMsgTypes.OsmosisTokenFactoryV1beta1MsgChangeAdmin
        ) {
          alerts.push({
            txHash: msg.tx_hash,
            details: {
              message: `Token admin for ${msg.data.denom} has been changed by ${msg.data.sender} to ${msg.data.new_admin}`,
            },
            addressesInvolved: msg.addresses,
            severity: 'critical',
            caption: 'Tokens admin has been changed',
          });
        }
      }
    }

    return alerts;
  };
}
