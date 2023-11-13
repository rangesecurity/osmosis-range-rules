import { TestingModule } from '@nestjs/testing';
import {
  IRangeAlertRule,
  IRangeBlock,
  NetworkEnum,
  TestRangeSDK,
} from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::IbcChannelFlowQuotaXService', () => {
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

  it('should generate an alert for transactions for IBCChannelFlowQuotaX', async () => {
    const block: IRangeBlock = {
      hash: '',
      height: 0,
      transactions: [],
      network: NetworkEnum.Osmosis1,
      timestamp: '',
    };
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelFlowQuotaX',
      id: '123',
      createdAt: new Date(),
      parameters: {
        quotaName: 'STARS-DAY-1',
        percentage: 0.01,
        contract:
          'osmo17r7qdw2zk6jyw62cvwm6flmhtj9q7zd26r8zc6sqyf0pnaq46cfss8hgxg',
        queryObj: {
          get_quotas: {
            channel_id: 'any',
            denom:
              'ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4',
          },
        },
      },
    };

    const result = await testRangeSDK.assertRuleWithBlock(block, mockRule);

    const expectedAlerts = [
      {
        addressesInvolved: [],
        details: {
          message:
            '0.01% limit has been reached for inflow of quota STARS-DAY-1',
        },
        txHash: '',
      },
      {
        addressesInvolved: [],
        details: {
          message:
            '0.01% limit has been reached for outflow of quota STARS-DAY-1',
        },
        txHash: '',
      },
    ];

    expect(result).toHaveLength(2);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not involving IBCChannelFlowQuotaX', async () => {
    const block: IRangeBlock = {
      hash: '',
      height: 0,
      transactions: [],
      network: NetworkEnum.Osmosis1,
      timestamp: '',
    };
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCChannelFlowQuotaX',
      id: '123',
      createdAt: new Date(),
      parameters: {
        quotaName: 'STARS-DAY-1',
        percentage: 90,
        contract:
          'osmo17r7qdw2zk6jyw62cvwm6flmhtj9q7zd26r8zc6sqyf0pnaq46cfss8hgxg',
        queryObj: {
          get_quotas: {
            channel_id: 'any',
            denom:
              'ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4',
          },
        },
      },
    };

    const result = await testRangeSDK.assertRuleWithBlock(block, mockRule);

    expect(result).toHaveLength(0);
  });
});
