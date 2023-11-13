import { Injectable, Logger } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  fetchBlocksByRange,
} from '@range-security/range-sdk';
import { AppConfigService } from '../../config/app.config.service';

const THRESHOLD = 1;
const BLOCK_RANGE = 10;
const OFFSET = 0;

interface IParameters {
  address: string;
}

@Injectable()
export class MoreThanXTxsInLastHourService implements OnBlock {
  private readonly logger = new Logger(MoreThanXTxsInLastHourService.name);
  private readonly THRESHOLD = 1;
  private readonly BLOCK_RANGE = 10;

  constructor(private config: AppConfigService) { }

  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block, rule) => {
    const p = rule.parameters as any as IParameters;

    const latestHeight = BigInt(block.height);
    const endHeight = (latestHeight - BigInt(1)).toString();
    const startHeight = (latestHeight - BigInt(this.BLOCK_RANGE)).toString();

    const blocks: IRangeBlock[] = await fetchBlocksByRange({
      token: this.config.app.RANGE_SDK_TOKEN,
      network: block.network,
      startHeight,
      endHeight,
    });

    const transactions = blocks.flatMap((b: any) => b.transactions);

    const targetTxs = transactions.filter((tx) => {
      return tx?.messages.some((m) => m.addresses.includes(p.address));
    });

    if (targetTxs.length > this.THRESHOLD) {
      return [
        {
          details: {
            message: `More than ${this.THRESHOLD} transactions detected by ${p.address} in last hour.`,
          },
          txHash: '',
          addressesInvolved: [p.address],
          caption: 'Transaction threshold reached by an address',
          severity: 'low',
        },
      ];
    }

    return [];
  };
}
