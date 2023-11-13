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
  address: string;
  threshold: number;
  blockWidth: number;
  blockWindow: number;
}

const messageTypesToMonitor = [
  'ibc.applications.transfer.v1.MsgTransfer',
  'ibc.core.channel.v1.MsgRecvPacket',
];

@Injectable()
export class IbcAddrTxsService implements OnBlock {
  private readonly logger = new Logger(IbcAddrTxsService.name);
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

    const transactions = blocks.flatMap((b) => b.transactions as any);

    const targetTxs = transactions.filter((tx) => {
      return tx.messages.some((m) => {
        return (
          messageTypesToMonitor.includes(m.type) &&
          m.addresses.includes(p.address)
        );
      });
    });

    if (targetTxs.length > p.threshold) {
      return [
        {
          details: {
            message: `More than ${p.threshold} transactions detected for address ${p.address} in last ${p.blockWidth} blocks.`,
          },
          txHash: '',
          addressesInvolved: [p.address],
          severity: 'medium',
          caption: 'IBC Transaction threshold reached by an address',
        },
      ];
    }

    return [];
  };
}
