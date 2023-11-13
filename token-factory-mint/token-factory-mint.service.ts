import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';

@Injectable()
export class TokenFactoryMintService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (
          msg.type === Osmosis1TrxMsgTypes.OsmosisTokenFactoryV1beta1MsgMint
        ) {
          alerts.push({
            txHash: msg.tx_hash,
            details: {
              message: `New tokens have been minted: ${msg.data.amount.amount} ${msg.data.amount.denom} by ${msg.data.sender} to ${msg.data.mintToAddress}`,
            },
            addressesInvolved: msg.addresses,
            severity: 'medium',
            caption: 'New tokens have been minted',
          });
        }
      }
    }

    return alerts;
  };
}
