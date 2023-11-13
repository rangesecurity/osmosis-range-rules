import { TestingModule } from '@nestjs/testing';
import { IRangeAlertRule, TestRangeSDK } from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::NewContractCodeStoredService', () => {
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

  it('should generate an alert for transactions that store new contract code', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11742779' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CosmwasmWasmV1MsgStoreCode',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        details: {
          message:
            'New CW contract code stored by osmo1ed6ezqx9t4e9sfm6nfgulq3005umrh6hkclagk',
        },
        txHash:
          '302AD3B8B7C5E65533684D9959834B47B6B98F1ED75382AFD16CB665B902C96C',
        addressesInvolved: ['osmo1ed6ezqx9t4e9sfm6nfgulq3005umrh6hkclagk'],
      },
    ];
    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions that do not store new contract code', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11745609' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CosmwasmWasmV1MsgStoreCode',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    expect(result).toHaveLength(0);
  });
});
