import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';

@Injectable()
export class TokenFactorySetDenomMetadataService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (
          msg.type ===
          Osmosis1TrxMsgTypes.OsmosisTokenFactoryV1beta1MsgSetDenomMetadata
        ) {
          alerts.push({
            txHash: msg.tx_hash,
            details: {
              message: `Token metadata has been updated to ${msg.data.metadata?.denom_units
                .map((d) => d.denom)
                .join(', ')} by ${msg.data.sender}`,
            },
            addressesInvolved: msg.addresses,
            severity: 'medium',
            caption: 'Token metadata has been updated',
          });
        }
      }
    }

    return alerts;
  };
}
