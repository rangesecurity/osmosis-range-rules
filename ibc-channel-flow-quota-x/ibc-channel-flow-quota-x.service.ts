import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  getCosmosClient,
} from '@range-security/range-sdk';

interface IParameters {
  contract: string;
  queryObj: object;
  quotaName: string;
  percentage: number;
}

interface IQuota {
  quota: {
    channel_value: string;
    max_percentage_send: number;
    max_percentage_recv: number;
  };
  flow: {
    inflow: number;
    outflow: number;
  };
}

@Injectable()
export class IbcChannelFlowQuotaXService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block, rule) => {
    const p = rule.parameters as any as IParameters;

    const subEvents: ISubEvent[] = [];

    const cosmosClient = await getCosmosClient('osmosis-1');
    const rawResult = await cosmosClient.fetchContractQuery(
      p.contract,
      p.queryObj,
    );
    const res = rawResult.data;

    const quota: IQuota = res.find((e) => e.quota.name === p.quotaName);

    const inFlowLimit =
      (p.percentage *
        ((quota.quota.max_percentage_send * Number(quota.quota.channel_value)) /
          100)) /
      100;
    const outFlowLimit =
      (p.percentage *
        ((quota.quota.max_percentage_recv * Number(quota.quota.channel_value)) /
          100)) /
      100;

    const netFlow = Math.abs(quota.flow.inflow - quota.flow.outflow);

    if (netFlow >= inFlowLimit) {
      subEvents.push({
        details: {
          message: `${p.percentage}% limit has been reached for inflow of quota ${p.quotaName}`,
        },
        txHash: '',
        addressesInvolved: [],
        caption: 'IBC channel flow quota limit reached',
      });
    }

    if (netFlow >= outFlowLimit) {
      subEvents.push({
        details: {
          message: `${p.percentage}% limit has been reached for outflow of quota ${p.quotaName}`,
        },
        txHash: '',
        addressesInvolved: [],
        caption: 'IBC channel flow quota limit reached',
      });
    }

    return subEvents;
  };
}
