import { TestingModule } from '@nestjs/testing';
import { IRangeAlertRule, TestRangeSDK } from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::UnusualHighGasUsageService', () => {
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

  it('should generate an alert for unusual high gas usage', async () => {
    const heights = Array.from({ length: 100 }, (_, index) => 11831000 + index);
    const mockRule: IRangeAlertRule = {
      ruleType: 'UnusualHighGasUsage',
      id: '123',
      createdAt: new Date(),
      parameters: {},
    };

    // The plan here is to train the model
    for (const h of heights) {
      const blockInfo = { network: 'osmosis-1', height: String(h) };
      const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    }

    // The plan here is to trigger the alert using a specific block with unusual high gas usage
    // const expectedAlerts = [
    //   {
    //     addressesInvolved: [
    //       'cosmos1lsxwru4dhyq3ry4cvckrgjskfa53se4jrz4sx7',
    //       'cosmosvaloper1tflk30mq5vgqjdly92kkhhq3raev2hnz6eete3',
    //     ],
    //     details: { message: 'Blacklisted address involved in transaction' },
    //     txHash:
    //       '55BFE18485ED50A0B2843826C3A9994C0BC3548F4CFE943612086CB6DF088FE2',
    //   },
    // ];

    // expect(result).toHaveLength(1);
    // expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for normal gas usage', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11831942' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'UnusualHighGasUsage',
      id: '123',
      createdAt: new Date(),
      parameters: {
        code_ids: ['40'],
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    expect(result).toHaveLength(0);
  });
});
