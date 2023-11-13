import { TestingModule } from '@nestjs/testing';
import { IRangeAlertRule, TestRangeSDK } from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::RelayerLowOnFundsService', () => {
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

  it('should generate an alert for transactions for relayer out of funds', async () => {
    const blockInfo = { network: 'osmosis-1', height: '10500000' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'RelayerLowOnFunds',
      id: '123',
      createdAt: new Date(),
      parameters: {
        relayer: 'osmo19pjtx7dah2fquf7udyxjv94h0eraha78ddzwlm',
        threshold: 11733000,
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        addressesInvolved: ['osmo19pjtx7dah2fquf7udyxjv94h0eraha78ddzwlm'],
        details: {
          message:
            'Relayer address osmo19pjtx7dah2fquf7udyxjv94h0eraha78ddzwlm is running low of funds.',
        },
        txHash: '',
      },
    ];

    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not relayer out of funds', async () => {
    const blockInfo = { network: 'osmosis-1', height: '10500000' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'RelayerLowOnFunds',
      id: '123',
      createdAt: new Date(),
      parameters: {
        relayer: 'osmo19pjtx7dah2fquf7udyxjv94h0eraha78ddzwlm',
        threshold: 1000,
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    expect(result).toHaveLength(0);
  });
});
