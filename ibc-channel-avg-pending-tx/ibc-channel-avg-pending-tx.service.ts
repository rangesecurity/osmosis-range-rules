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
  channelId: string;
  thresholdPerc: number;
  blockWidth: number;
  blockWindow: number;
}

const ibcTransfer = 'ibc.applications.transfer.v1.MsgTransfer';
// const ibcReceive = 'ibc.core.channel.v1.MsgRecvPacket';
const ibcAcknowledgement = 'ibc.core.channel.v1.MsgAcknowledgement';

const db = new Map<string, number[]>();

@Injectable()
export class IbcChannelAvgPendingTxService implements OnBlock {
  private readonly logger = new Logger(IbcChannelAvgPendingTxService.name);
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

    let ibcTxArray = [];
    allMessages.forEach((m) => {
      if (m.type === ibcTransfer && m.data.sourceChannel === p.channelId) {
        ibcTxArray.push(
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

        ibcTxArray = ibcTxArray.filter((tx) => tx !== msgKey);
      }
    });

    const pendingHistory = db.get(p.channelId) || [];
    const pendingAvg =
      pendingHistory.reduce((a, b) => a + b, 0) / pendingHistory.length;

    const diffPercentage =
      100 * ((ibcTxArray.length - pendingAvg) / pendingAvg);

    pendingHistory.push(ibcTxArray.length);
    db.set(p.channelId, pendingHistory);

    if (pendingHistory.length === 1) return [];
    if (diffPercentage >= p.thresholdPerc) {
      return [
        {
          details: {
            message: `The number of pending transactions in ${p.channelId} is ${ibcTxArray.length} which is ${diffPercentage}% higher from the average of ${pendingAvg} in the last ${p.blockWidth} blocks.`,
          },
          txHash: '',
          addressesInvolved: [],
          caption: 'IBC Channel Pending Tx Threshold Reached',
        },
      ];
    }

    return [];
  };
}
