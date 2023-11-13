import { TestingModule } from '@nestjs/testing';
import { IRangeAlertRule, TestRangeSDK } from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::SlashingMsgUnjailService', () => {
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

  it('should generate an alert for transactions for slashing-msg-unjail', async () => {
    const blockInfo = { network: 'osmosis-1', height: '17581183' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CosmosSlashingV1beta1MsgUnjail',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        details: {
          message:
            'Validator cosmosvaloper1yh089p0cre4nhpdqw35uzde5amg3qzexkeggdn has been unjailed after a slash event',
        },
        txHash:
          '0eddcb6e1c3c2c4779f4603737568a8b725ca368d2d74c495a83e8d248c66ac4',
        addressesInvolved: [
          'cosmosvaloper1yh089p0cre4nhpdqw35uzde5amg3qzexkeggdn',
        ],
      },
    ];
    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not involving slashing-msg-unjail', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11745609' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CosmosGovV1beta1MsgDeposit',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    expect(result).toHaveLength(0);
  });
});
