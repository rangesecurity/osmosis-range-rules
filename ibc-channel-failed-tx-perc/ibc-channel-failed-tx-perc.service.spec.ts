import { TestingModule } from '@nestjs/testing';
import {
  IRangeAlertRule,
  NetworkEnum,
  TestRangeSDK,
} from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::IbcChannelFailedTxPercService', () => {
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

  it('should generate an alert for transactions for ibc-channel-failed-tx', async () => {
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelFailedTxPerc',
      id: '123',
      createdAt: new Date(),
      parameters: {
        blockWidth: 100,
        channelId: 'channel-143',
        thresholdPerc: 100,
        blockWindow: 65,
      },
    };

    let blockInfo;
    blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500100',
    };
    await testRangeSDK.assertRule(blockInfo, mockRule);

    blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10501335',
    };
    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        addressesInvolved: [],
        details: {
          message:
            'The amount of failed transactions in channel-143 has exceeded 100% than the average of 1 in the last 100 blocks.',
        },
        txHash: '',
      },
    ];

    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not involving ibc-channel-failed-tx', async () => {
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelFailedTxPerc',
      id: '123',
      createdAt: new Date(),
      parameters: {
        blockWidth: 100,
        channelId: 'channel-143',
        thresholdPerc: 3,
      },
    };

    let blockInfo;
    blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10500100',
    };
    await testRangeSDK.assertRule(blockInfo, mockRule);

    blockInfo = {
      network: NetworkEnum.Osmosis1,
      height: '10501300',
    };
    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    expect(result).toHaveLength(0);
  });
});