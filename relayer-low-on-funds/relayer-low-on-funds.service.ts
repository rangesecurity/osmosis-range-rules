import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  getCosmosClient,
} from '@range-security/range-sdk';

interface IParameters {
  relayer: string;
  threshold: number;
}

@Injectable()
export class RelayerLowOnFundsService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ) => Promise<ISubEvent[]> = async (_block, rule) => {
    const p = rule.parameters as any as IParameters;
    const cosmosClient = await getCosmosClient('osmosis-1');
    const balance = await cosmosClient.balance(p.relayer, 'uosmo');

    if (Number(balance.balance?.amount) < p.threshold) {
      const results = [
        {
          details: {
            message: `Relayer address ${p.relayer} is running low of funds.`,
          },
          txHash: '',
          addressesInvolved: [p.relayer],
          severity: 'low',
          caption: 'Relayer low on funds',
        },
      ];
      return results;
    }

    return [];
  };
}
