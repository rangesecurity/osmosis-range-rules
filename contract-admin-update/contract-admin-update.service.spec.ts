import { TestingModule } from '@nestjs/testing';
import { IRangeAlertRule, TestRangeSDK } from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::ContractAdminUpdateService', () => {
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

  it('should generate an alert for transactions updating contract admin', async () => {
    const blockInfo = { network: 'osmosis-1', height: '10406409' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CosmwasmWasmV1MsgUpdateAdmin',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        details: {
          message:
            'Cosmwasm contract admin updated to <new_admin> by <sender> for contract <contract>',
        },
        txHash:
          'BFE12E319B22686E66357A2B4108A1032645586D1B626CF395F0C3B01375F9BD',
        addressesInvolved: [
          'osmo1jcfwl25awrv5n9mnxv85c34a4darx2gn9hms5n7g7h3904c8uhhs3a2n9h',
        ], // adjust according to your expected result
      },
    ];
    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not updating contract admin', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11745609' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CosmwasmWasmV1MsgUpdateAdmin',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    expect(result).toHaveLength(0);
  });
});
