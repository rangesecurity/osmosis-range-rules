import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';

@Injectable()
export class SlashingMsgUpdateParamsService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (
          msg.type === Osmosis1TrxMsgTypes.CosmosSlashingV1beta1MsgUpdateParams
        ) {
          alerts.push({
            txHash: msg.tx_hash,
            details: {
              message: `The parameters for the Slashing module have been updated by authority address ${msg.data.authority
                }. Current parameters: ${JSON.stringify(msg.data.params)}`,
            },
            addressesInvolved: msg.addresses,
            severity: 'info',
            caption: 'Slashing module params updated',
          });
        }
      }
    }

    return alerts;
  };
}
