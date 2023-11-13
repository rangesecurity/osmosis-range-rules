import { Injectable, Logger } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  fetchBlocksByRange,
} from '@range-security/range-sdk';
import { AppConfigService } from '../../config/app.config.service';

interface IParameters {
  blockWidth: number;
  channelId: string;
  blockWindow: number;
  thresholdPerc: number;
}

const ibcTransfer = 'ibc.applications.transfer.v1.MsgTransfer';
const ibcReceive = 'ibc.core.channel.v1.MsgRecvPacket';

const db = new Map<string, number[]>();

@Injectable()
export class IbcChannelNumTxsService implements OnBlock {
  private readonly logger = new Logger(IbcChannelNumTxsService.name);
  constructor(private config: AppConfigService) { }
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block, rule) => {
    const p = rule.parameters as any as IParameters;

    if (Number(block.height) % p.blockWindow !== 0) return [];

    const latestHeight = BigInt(block.height);
    const startHeight = (latestHeight - BigInt(p.blockWidth + 1)).toString();
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

    // console.log(allMessages);

    const targetMessages = allMessages.filter((m) => {
      if (m.type === ibcTransfer) {
        // console.log(m.data.sourceChannel);
        return m.data.sourceChannel === p.channelId;
      }

      if (m.type === ibcReceive) {
        // console.log(m.data.packet.sourceChannel);
        return m.data.packet.sourceChannel === p.channelId;
      }

      return false;
    });

    const entries = db.get(p.channelId) || [];
    const avgTxs = entries.reduce((acc, val) => acc + val, 0) / entries.length;
    entries.push(targetMessages.length);
    db.set(p.channelId, entries);

    const diffPercentage =
      100 * Math.abs((avgTxs - targetMessages.length) / avgTxs);

    if (entries.length === 1) return [];

    if (diffPercentage >= p.thresholdPerc) {
      return [
        {
          details: {
            message: `The amount of transactions in channel ${p.channelId} has exceeded the average by ${p.thresholdPerc}% in the last ${p.blockWidth} blocks.`,
          },
          txHash: '',
          addressesInvolved: [],
          caption: 'IBC channel transaction threshold reached.',
        },
      ];
    }

    return [];
  };
}
