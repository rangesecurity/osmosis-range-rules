import { Injectable, Logger } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  fetchBlocksByRange,
} from '@range-security/range-sdk';
import { AppConfigService } from '../../../src/config/app.config.service';

const ibcTransfer = 'ibc.applications.transfer.v1.MsgTransfer';
// const ibcReceive = 'ibc.core.channel.v1.MsgRecvPacket';
const ibcAcknowledgement = 'ibc.core.channel.v1.MsgAcknowledgement';

interface IParameters {
  channelId: string;
  threshold: number;
  blockWidth: number;
  blockWindow: number;
}

@Injectable()
export class IbcChannelPendingTxService implements OnBlock {
  private readonly logger = new Logger(IbcChannelPendingTxService.name);
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

    const pendingMessages = new Set();
    allMessages.forEach((m) => {
      if (m.type === ibcTransfer && m.data.sourceChannel === p.channelId) {
        pendingMessages.add(
          JSON.stringify({
            sender: m.data.sender,
            receiver: m.data.receiver,
            amount: m.data.token.amount,
          }),
        );
      }

      if (
        m.type === ibcAcknowledgement &&
        m.data.packet.sourceChannel === p.channelId
      ) {
        const msgData: any = JSON.parse(atob(m.data.packet.data));
        const msgKey = JSON.stringify({
          sender: msgData.sender,
          receiver: msgData.receiver,
          amount: msgData.amount,
        });

        if (pendingMessages.has(msgKey)) {
          pendingMessages.delete(msgKey);
        }
      }
    });

    const pendingTxs = pendingMessages.size;

    if (pendingTxs >= p.threshold) {
      return [
        {
          details: {
            message: `The number of pending transactions in channel ${p.channelId} is ${pendingTxs} which is above the threshold of ${p.threshold} in last ${p.blockWidth} blocks.`,
          },
          txHash: '',
          addressesInvolved: [],
          caption: 'IBC Pending transactions threshold reached',
        },
      ];
    }
    return [];
  };
}
