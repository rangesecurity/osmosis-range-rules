import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
} from '@range-security/range-sdk';
import { GasUsageAnalyzer } from './utils/GasUsageAnalyzer';

const gasUsageAnalyzer = new GasUsageAnalyzer();

@Injectable()
export class UnusualHighGasUsageService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const alerts: ISubEvent[] = [];

    for (const tx of block.transactions) {
      if (tx.messages.length === 1) {
        const dp = {
          messageType: tx.messages[0].type,
          gasUsage: 10, // todo: fix me, currently hardcoded value to fix type error
          timestamp: new Date(block.timestamp),
        };

        const isOutlier = gasUsageAnalyzer.checkOutlier(dp);

        if (isOutlier) {
          alerts.push({
            details: {
              message: 'Unusual high gas usage detected',
            },
            txHash: tx.hash,
            addressesInvolved: tx.messages[0].addresses,
            caption: 'Unusual high gas usage detected',
          });
        }

        gasUsageAnalyzer.addDataPoint(dp);
      }
    }

    return alerts;
  };
}
