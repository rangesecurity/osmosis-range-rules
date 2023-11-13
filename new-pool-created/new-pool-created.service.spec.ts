import { TestingModule } from '@nestjs/testing';
import { IRangeAlertRule, TestRangeSDK } from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::NewPoolCreatedService', () => {
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

  it('should generate an alert for transactions that create a new MsgCreateBalancerPool', async () => {
    const blockInfo = { network: 'osmosis-1', height: '10899818' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CreateBalancerPool',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        details: { message: 'A new pool is created.' },
        txHash:
          '8047B17A689C591A295F47F76136297C3A8F0EDF48E78DB88D23A9D4AA7932DC',
        addressesInvolved: ['osmo1vs38dzqt9lph5f2ht56lqq2vm7te9k3wc2zm75'],
      },
    ];
    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should generate an alert for transactions that create a new CreateStableswapPool', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11860713' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CreateStableswapPool',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);

    const expectedAlerts = [
      {
        details: { message: 'A new pool is created.' },
        txHash:
          '9276A7E6C81C6721AF85EBF827789095CEB0B14A8FB7EF3628ADF2ADFB2C6028',
        addressesInvolved: ['osmo1afdldsteedpknjpu7pvglnj3c9yrqm45a5kptv'],
      },
    ];
    expect(result).toHaveLength(1);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions that do not create a new MsgCreateBalancerPool pool', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11745609' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CreateBalancerPool',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    expect(result).toHaveLength(0);
  });

  it('should not generate any alerts for transactions that do not create a new CreateStableswapPool pool', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11745609' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'CreateStableswapPool',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    expect(result).toHaveLength(0);
  });
});
