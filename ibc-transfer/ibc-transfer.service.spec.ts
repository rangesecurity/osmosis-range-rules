import { TestingModule } from '@nestjs/testing';
import { IRangeAlertRule, TestRangeSDK } from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::IbcTransferService', () => {
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

  it('should generate an alert for transactions for a sent ibc-transfer', async () => {
    const blockInfo = { network: 'osmosis-1', height: '10500000' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCTransfer',
      id: '123',
      workspaceId: 'workspaceId1234',
      createdAt: new Date(),
      parameters: {
        tags: [],
        denom:
          'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
        target: 'address',
        addresses: ['osmo1y8ppdhgdy4gzxjd2rrxfm5wa607fzpu3hu6yr0'],
        direction: 'sent',
        comparator: '<=',
        thresholdValue: 55130000,
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    const expectedAlerts = [
      {
        workspaceId: 'workspaceId1234',
        alertRuleId: '123',
        time: '2023-07-12T11:51:24.549Z',
        blockNumber: '10500000',
        network: 'osmosis-1',
        addressesInvolved: [
          'osmo1y8ppdhgdy4gzxjd2rrxfm5wa607fzpu3hu6yr0',
          'cosmos1y8ppdhgdy4gzxjd2rrxfm5wa607fzpu3l8f54a',
        ],
        txHash:
          '00f91a6d1ed8bf07141f285e2ee0cab413dd994be8d48e359d4697c8c6d8d8e5',
        details: {
          message:
            'IBC Transfer detected for: osmo1y8ppdhgdy4gzxjd2rrxfm5wa607fzpu3hu6yr0\n' +
            'This activity is associated with the following address: osmo1y8ppdhgdy4gzxjd2rrxfm5wa607fzpu3hu6yr0\n' +
            'An amount of 104314269 is transferred from osmo1y8ppdhgdy4gzxjd2rrxfm5wa607fzpu3hu6yr0 to cosmos1y8ppdhgdy4gzxjd2rrxfm5wa607fzpu3l8f54a\n' +
            'which is <= 55130000',
        },
      },
    ];
    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should generate an alert for transactions for a received ibc-transfer', async () => {
    const blockInfo = { network: 'osmosis-1', height: '10500000' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCTransfer',
      id: '123',
      workspaceId: 'workspaceId1234',
      createdAt: new Date(),
      parameters: {
        tags: [],
        denom: 'uflix',
        target: 'address',
        addresses: ['osmo1cx82d7pm4dgffy7a93rl6ul5g84vjgxk0a4n97'],
        direction: 'received',
        comparator: '<=',
        thresholdValue: 1600000,
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    const expectedAlerts = [
      {
        workspaceId: 'workspaceId1234',
        alertRuleId: '123',
        time: '2023-07-12T11:51:24.549Z',
        blockNumber: '10500000',
        network: 'osmosis-1',
        addressesInvolved: ['osmo1cx82d7pm4dgffy7a93rl6ul5g84vjgxk0a4n97'],
        txHash:
          '2ff5b3af821b6b5e107e35f1270de001a1503780d40836c1026a2c558495a87a',
        details: {
          message:
            'IBC Transfer detected for: osmo1cx82d7pm4dgffy7a93rl6ul5g84vjgxk0a4n97\n' +
            'This activity is associated with the following address: osmo1cx82d7pm4dgffy7a93rl6ul5g84vjgxk0a4n97\n' +
            'An amount of 1600000 is transferred from omniflix1gsdddlk569m46sxu7t838uj4q2w8v0vxuca6sv to osmo1gsdddlk569m46sxu7t838uj4q2w8v0vxfaln3q\n' +
            'which is <= 1600000',
        },
      },
    ];
    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not involving ibc-transfer', async () => {
    const blockInfo = { network: 'osmosis-1', height: '10503971' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'IBCTransfer',
      id: '123',
      workspaceId: 'workspaceId1234',
      createdAt: new Date(),
      parameters: {
        tags: [],
        denom:
          'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
        target: 'address',
        direction: 'received',
        addresses: ['osmo1gmc3y8scyx9nemnuk8tj0678mn4w5l78313qvh'],
        comparator: '<=',
        thresholdValue: 55130000,
      },
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [];
    expect(result).toHaveLength(0);
    expect(result).toEqual(expectedAlerts);
  });
});
