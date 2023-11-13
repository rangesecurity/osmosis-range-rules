import { TestingModule } from '@nestjs/testing';
import {
  IRangeAlertRule,
  NetworkEnum,
  TestRangeSDK,
} from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::IbcChannelPendingTxService', () => {
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

  it('should generate an alert for transactions for ibc-channel-pending-tx', async () => {
    const blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500100',
    };
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelPendingTx',
      id: '123',
      createdAt: new Date(),
      parameters: {
        channelId: 'channel-0',
        threshold: 1,
        blockWidth: 100,
        blockWindow: 100,
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        addressesInvolved: [],
        details: {
          message:
            'The number of pending transactions in channel channel-0 is 2 which is above the threshold of 1 in last 600 blocks.',
        },
        txHash: '',
      },
    ];

    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not involving ibc-channel-pending-tx', async () => {
    const blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500300',
    };
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelPendingTx',
      id: '123',
      createdAt: new Date(),
      parameters: {
        channelId: 'channel-0',
        threshold: 10,
        blockWidth: 100,
        blockWindow: 100,
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    expect(result).toHaveLength(0);
  });
});
