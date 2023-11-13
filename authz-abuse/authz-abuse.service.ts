import { Inject, Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  fetchBlocksByRange,
  Osmosis1Block,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { AppConfigService } from '../../config/app.config.service';
import { RedisKeys } from '../../utils/redis-keys';

@Injectable()
export class AuthzAbuseService implements OnBlock {
  private readonly ExecutionInterval = 10; // 1 hour
  private readonly BlockRange = (60 * 60) / 6; // Total blocks in 1 hour
  private readonly ExecThreshold = 10;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private config: AppConfigService,
  ) {}

  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block, rule) => {
    // lastExecution store as timestamp
    const lastExecution = await this.cacheManager.get<number>(
      RedisKeys.getLastExecutedAtOfRuleByRuleGroupIdAndRuleId({
        ruleGroupId: rule.ruleGroupId,
        ruleId: rule.id,
      }),
    );

    // Skip if last execution was less than 10 minute ago
    if (
      lastExecution &&
      dayjs().diff(dayjs(lastExecution), 'minutes', true) <
        this.ExecutionInterval
    ) {
      return [];
    }

    // Update the last execution to avoid race conditions and cases where func short-circuits i.e func errors out before updating lastExecution
    await this.cacheManager.set(
      RedisKeys.getLastExecutedAtOfRuleByRuleGroupIdAndRuleId({
        ruleGroupId: rule.ruleGroupId,
        ruleId: rule.id,
      }),
      new Date(),
    );

    const latestHeight = BigInt(block.height);
    const endHeight = (latestHeight - BigInt(1)).toString();
    const startHeight = (latestHeight - BigInt(this.BlockRange)).toString();

    const blocks = (await fetchBlocksByRange({
      token: this.config.app.RANGE_SDK_TOKEN,
      network: block.network,
      startHeight,
      endHeight,
    })) as Osmosis1Block[];

    // count the number of grant messages per grantee
    const granteeCount = new Map<string, number>();
    for (const block of blocks) {
      for (const trx of block.transactions) {
        for (const msg of trx.messages) {
          if (msg.type === Osmosis1TrxMsgTypes.CosmosAuthzV1beta1MsgGrant) {
            const { grantee } = msg.data;
            if (grantee) {
              granteeCount.set(grantee, granteeCount.get(grantee) || 0 + 1);
            }
          }
        }
      }
    }

    // filter out grantee that have executed equal or more than the threshold
    const granteeCountFiltered = new Map<string, number>();
    for (const [grantee, count] of granteeCount) {
      if (count >= this.ExecThreshold) {
        granteeCountFiltered.set(grantee, count);
      }
    }

    const alerts: ISubEvent[] = [];
    for (const [grantee, count] of granteeCountFiltered) {
      alerts.push({
        txHash: block.transactions[0].hash,
        details: {
          message: `Suspicious repeated use of AuthZ Grant. Address ${grantee} has been granted capabilities ${count} times in the last 1 hour`,
        },
        addressesInvolved: [],
        caption: 'Suspicious multiple authz messages',
      });
    }

    return alerts;
  };
}
