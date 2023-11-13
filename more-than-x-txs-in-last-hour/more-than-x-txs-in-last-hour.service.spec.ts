import { TestingModule } from '@nestjs/testing';
import { IRangeAlertRule, TestRangeSDK } from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::MoreThanXTxsInLastHourService', () => {
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

  it('should generate an alert for txs with more than x txs in last hour', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11831941' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'MoreThanXTxsInLastHourService',
      id: '123',
      createdAt: new Date(),
      parameters: {
        targetAddress: 'osmo125630xvkt5w8kcmawrrpmwlg6yzy3f9mpcghaz',
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        addressesInvolved: ['osmo125630xvkt5w8kcmawrrpmwlg6yzy3f9mpcghaz'],
        details: {
          message: 'More than 1 transactions detected in last hour.',
        },
        txHash: '',
      },
    ];

    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for txs with no txs in last hour', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11831999' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'MoreThanXTxsInLastHourService',
      id: '123',
      createdAt: new Date(),
      parameters: {
        targetAddress: 'osmo125630xvkt5w8kcmawrrpmwlg6yzy3f9mpcghaa',
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    expect(result).toHaveLength(0);
  });
});
