import { Injectable, Logger } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  fetchBlocksByRange,
} from '@range-security/range-sdk';
import { AppConfigService } from '../../../src/config/app.config.service';

interface IParameters {
  blockWindow: number;
  blockWidth: number;
  thresholdPerc: number;
  channelId: string;
}

const ibcTimeout = 'ibc.core.channel.v1.MsgTimeout';

const db = new Map();

@Injectable()
export class IbcChannelFailedTxPercService implements OnBlock {
  private readonly logger = new Logger(IbcChannelFailedTxPercService.name);
  constructor(private config: AppConfigService) { }
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block, rule) => {
    const p = rule.parameters as any as IParameters;
    if (Number(block.height) % p.blockWindow !== 0) return [];

    const latestHeight = BigInt(block.height);
    const startHeight = (latestHeight - BigInt(p.blockWidth - 1)).toString();
    const endHeight = latestHeight.toString();

    const blocks: IRangeBlock[] = await fetchBlocksByRange({
      token: this.config.app.RANGE_SDK_TOKEN,
      network: block.network,
      startHeight,
      endHeight,
    });

    const allMessages = blocks.flatMap((b) =>
      b.transactions.flatMap((tx) => tx.messages),
    );

    const targetMessages = allMessages.filter((m) => {
      if (m.type === ibcTimeout) {
        return m.data.packet.sourceChannel === p.channelId;
      }

      return false;
    });

    const entries = db.get(p.channelId) || [];
    const avgTxs = entries.reduce((acc, val) => acc + val, 0) / entries.length;
    entries.push(targetMessages.length);
    db.set(p.channelId, entries);

    const diffPercentage = 100 * ((targetMessages.length - avgTxs) / avgTxs);

    if (entries.length === 1) return [];
    if (diffPercentage >= p.thresholdPerc) {
      return [
        {
          details: {
            message: `The amount of failed transactions in ${p.channelId} has exceeded ${p.thresholdPerc}% than the average of ${avgTxs} in the last ${p.blockWidth} blocks.`,
          },
          txHash: '',
          addressesInvolved: [],
          severity: 'low',
          caption: 'IBC Channel Failed Tx Percentage Threshold Reached',
        },
      ];
    }

    return [];
  };
}
