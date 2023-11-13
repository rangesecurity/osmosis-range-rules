import { TestingModule } from '@nestjs/testing';
import {
  IRangeAlertRule,
  NetworkEnum,
  TestRangeSDK,
} from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::IbcChannelAvgPendingTxService', () => {
  let service: ProcessorsService;
  let testRangeSDK: TestRangeSDK;

  beforeAll(async () => {
    const module: TestingModule = await TestProcessorServiceProvider();
    service = module.get<ProcessorsService>(ProcessorsService);
    testRangeSDK = module.get(RANGE_SDK_PROVIDER);
    testRangeSDK.init({
      onBlock: { callback: service.getProcessorCallback().callback },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(testRangeSDK).toBeDefined();
    expect(testRangeSDK.assertRule).toBeDefined();
    expect(testRangeSDK.assertRuleWithBlock).toBeDefined();
    expect(testRangeSDK.init).toBeDefined();
    expect(testRangeSDK.gracefulCleanup).toBeDefined();
  });

  it('should generate an alert for transactions for ibc-channel-avg-pending-tx', async () => {
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelAvgPendingTx',
      id: '123',
      createdAt: new Date(),
      parameters: {
        channelId: 'channel-0',
        thresholdPerc: 1,
        blockWidth: 20,
        blockWindow: 20,
      },
    };

    let blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500420',
    };
    await testRangeSDK.assertRule(blockInfo, mockRule);

    blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500460',
    };
    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        addressesInvolved: [],
        details: {
          message:
            'The number of pending transactions in channel-0 is 3 which is 50% higher from the average of 2 in the last 20 blocks.',
        },
        txHash: '',
      },
    ];

    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not involving ibc-channel-avg-pending-tx', async () => {
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelAvgPendingTx',
      id: '123',
      createdAt: new Date(),
      parameters: {
        channelId: 'channel-0',
        thresholdPerc: 1,
        blockWidth: 20,
      },
    };

    let blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500480',
    };
    await testRangeSDK.assertRule(blockInfo, mockRule);

    blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500500',
    };
    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    expect(result).toHaveLength(0);
  });
});
