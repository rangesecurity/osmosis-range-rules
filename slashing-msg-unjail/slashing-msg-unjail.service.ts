import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';

@Injectable()
export class SlashingMsgUnjailService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (msg.type === Osmosis1TrxMsgTypes.CosmosSlashingV1beta1MsgUnjail) {
          alerts.push({
            txHash: msg.tx_hash,
            details: {
              message: `Validator ${msg.data.validatorAddr} has been unjailed after a slash event`,
            },
            addressesInvolved: msg.addresses,
            severity: 'info',
            caption: 'Slashed validator unjailed',
          });
        }
      }
    }

    return alerts;
  };
}
