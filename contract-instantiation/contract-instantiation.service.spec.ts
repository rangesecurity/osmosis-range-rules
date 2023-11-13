import { TestingModule } from '@nestjs/testing';
import { IRangeAlertRule, TestRangeSDK } from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::ContractInstantiationService', () => {
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

  it('should generate an alert for txs with contract instantiation', async () => {
    const mockRule: IRangeAlertRule = {
      ruleType: 'ContractInstantiation',
      id: '123',
      createdAt: new Date(),
      parameters: {
        code_ids: ['40'],
      },
    };

    const blockInfo = { network: 'osmosis-1', height: '11831941' };
    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        addressesInvolved: ['osmo16swu22j6fj6zflu24sk5g20aww3ze66tsg7u3h'],
        details: {
          message: 'Cosmwasm contract instantiated for code id: 40',
        },
        txHash:
          '06738c31da1f203e8870ff0966a2158d42f6d757ae2326498f499e9475bf5017',
      },
    ];

    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not involving contract instantiation', async () => {
    const mockRule: IRangeAlertRule = {
      ruleType: 'ContractInstantiation',
      id: '123',
      createdAt: new Date(),
      parameters: {
        code_ids: ['40'],
      },
    };

    const blockInfo = { network: 'osmosis-1', height: '11831942' };
    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    expect(result).toHaveLength(0);
  });
});
