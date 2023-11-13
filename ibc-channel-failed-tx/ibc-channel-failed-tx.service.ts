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
  threshold: number;
  channelId: string;
}

const ibcTimeout = 'ibc.core.channel.v1.MsgTimeout';

@Injectable()
export class IbcChannelFailedTxService implements OnBlock {
  private readonly logger = new Logger(IbcChannelFailedTxService.name);
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

    if (targetMessages.length >= p.threshold) {
      return [
        {
          details: {
            message: `The amount of failed transactions in ${p.channelId} has exceeded ${p.threshold} in the last ${p.blockWidth} blocks.`,
          },
          txHash: '',
          addressesInvolved: [],
          severity: 'low',
          caption: 'IBC Channel Failed Tx Threshold Reached',
        },
      ];
    }

    return [];
  };
}
