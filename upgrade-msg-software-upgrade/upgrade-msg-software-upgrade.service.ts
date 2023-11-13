import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';

@Injectable()
export class UpgradeMsgSoftwareUpgradeService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (
          msg.type ===
          Osmosis1TrxMsgTypes.CosmosUpgradeV1beta1MsgSoftwareUpgrade
        ) {
          alerts.push({
            txHash: msg.tx_hash,
            details: {
              message: `A network software upgrade has been initialized by authority address ${
                msg.data.authority
              }. The upgrade plan is the following: ${JSON.stringify(
                msg.data.plan,
              )}`,
            },
            addressesInvolved: msg.addresses,
            severity: 'info',
            caption: 'Network software upgrade initialized',
          });
        }
      }
    }

    return alerts;
  };
}
