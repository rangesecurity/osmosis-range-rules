import { TestingModule } from '@nestjs/testing';
import {
  IRangeAlertRule,
  NetworkEnum,
  TestRangeSDK,
} from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::IbcChannelNumTxsService', () => {
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

  it('should generate an alert for transactions for ibc-channel-num-txs', async () => {
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelNumTxs',
      id: '123',
      createdAt: new Date(),
      parameters: {
        thresholdPerc: 10,
        blockWidth: 50,
        channelId: 'channel-0',
        blockWindow: 50,
      },
    };

    let blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500100',
    };
    await testRangeSDK.assertRule(blockInfo, mockRule);

    blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500150',
    };
    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        addressesInvolved: [],
        details: {
          message:
            'The amount of transactions in channel channel-0 has exceeded the average by 10% in the last 50 blocks.',
        },
        txHash: '',
      },
    ];

    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not involving ibc-channel-num-txs', async () => {
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelNumTxs',
      id: '123',
      createdAt: new Date(),
      parameters: {
        thresholdPerc: 50,
        blockWidth: 50,
        channelId: 'channel-0',
      },
    };

    let blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500100',
    };
    await testRangeSDK.assertRule(blockInfo, mockRule);

    blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500150',
    };
    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    expect(result).toHaveLength(0);
  });
});
