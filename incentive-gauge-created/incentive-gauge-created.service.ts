import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsg,
  Osmosis1TrxMsgTypes,
  Osmosis1TrxMsgOsmosisIncentivesMsgCreateGauge,
} from '@range-security/range-sdk';

export interface IncentiveGaugeCreatedTrxMsgData {
  owner: string;
  distributeTo: {
    denom: string;
    duration: string;
    timestamp: string;
  };
  coins: {
    denom: string;
    amount: string;
  }[];
  startTime: string;
  numEpochsPaidOver: string;
}

@Injectable()
export class IncentiveGaugeCreatedService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const allMessages: Osmosis1TrxMsg[] = block.transactions.flatMap(
      (tx) => tx.messages,
    );
    const targetMessages = allMessages.filter((m) => {
      return m.type === Osmosis1TrxMsgTypes.OsmosisIncentivesMsgCreateGauge;
    }) as Osmosis1TrxMsgOsmosisIncentivesMsgCreateGauge[];

    const results: ISubEvent[] = targetMessages.map((m) => {
      const { data } = m;
      return {
        details: {
          message: `A new incentives gauge has been created with start time ${data.startTime}`,
        },
        txHash: m.tx_hash,
        addressesInvolved: m.addresses,
        severity: 'info',
        caption: 'Incentives gauge created',
      };
    });

    return results;
  };
}
