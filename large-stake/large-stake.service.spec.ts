import { TestingModule } from '@nestjs/testing';
import {
  IRangeAlertRule,
  IRangeBlock,
  TestRangeSDK,
  NetworkEnum,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';
import { ProcessorsService } from '../processors.service';
import { RANGE_SDK_PROVIDER } from '../../range-sdk.provider';
import { TestProcessorServiceProvider } from '../../../test/alert-rules-utils/test-processor-service-provider';

describe('ProcessorsService::LargeStakeService', () => {
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

  it('should generate an alert for transactions for large stake', async () => {
    const mockRule: IRangeAlertRule = {
      ruleType: 'LargeStake',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    /**
     * Since we don't have the block which triggers to the condition
     */
    const block: IRangeBlock = {
      hash: 'A2316D139F728E809333EFEEC9A7C0B5743B8F986671309D0E994F54CAA9BA09',
      height: 11841067,
      network: NetworkEnum.Osmosis1,
      timestamp: '2023-10-11T01:15:21.767Z',
      transactions: [
        {
          data: '',
          type: '',
          tx_hash:
            '7c99c2b4197b56d65c4abb91ad5a9d6fe6fc1d4c9f0e0e72f4eccf10756d0e53',
          index: 0,
          block_number: '11841067',
          status: 'OK',
          network_id: 'osmosis-1',
          messages: [
            {
              network_id: NetworkEnum.Osmosis1,
              block_number: '11841067',
              data: {
                amount: { denom: 'uosmo', amount: '1000000000000' },
                delegatorAddress: 'osmo1cyql4zulfc4gv5ss5j2fsvupzvgmc6dwdgycsz',
                validatorAddress:
                  'osmovaloper16vnsrhxsyamf4f4eln6g587qwwd39fte2m2ysc',
              },
              type: Osmosis1TrxMsgTypes.CosmosStakingV1beta1MsgDelegate,
              index: 0,
              status: 'OK',
              tx_hash:
                '7c99c2b4197b56d65c4abb91ad5a9d6fe6fc1d4c9f0e0e72f4eccf10756d0e53',
              addresses: [],
            },
            {
              network_id: NetworkEnum.Osmosis1,
              block_number: '11841067',
              data: {
                amount: { denom: 'uosmo', amount: '5000000000000' },
                delegatorAddress: 'osmo1cyql4zulfc4gv5ss5j2fsvupzvgmc6dwdgycsz',
                validatorAddress:
                  'osmovaloper16vnsrhxsyamf4f4eln6g587qwwd39fte2m2ysc',
              },
              type: Osmosis1TrxMsgTypes.CosmosStakingV1beta1MsgDelegate,
              index: 1,
              status: 'OK',
              tx_hash:
                '7c99c2b4197b56d65c4abb91ad5a9d6fe6fc1d4c9f0e0e72f4eccf10756d0e53',
              addresses: [],
            },
          ],
          addresses: [],
        },
      ],
    };

    const result = await testRangeSDK.assertRuleWithBlock(block, mockRule);
    const expectedAlerts = [
      {
        details: {
          message:
            'A huge amount delegate action of "5000000000000" has been performed by osmo1cyql4zulfc4gv5ss5j2fsvupzvgmc6dwdgycsz',
        },
        txHash:
          '7c99c2b4197b56d65c4abb91ad5a9d6fe6fc1d4c9f0e0e72f4eccf10756d0e53',
        addressesInvolved: [],
      },
      {
        details: {
          message:
            'A high amount delegate action of "1000000000000" has been performed by osmo1cyql4zulfc4gv5ss5j2fsvupzvgmc6dwdgycsz',
        },
        txHash:
          '7c99c2b4197b56d65c4abb91ad5a9d6fe6fc1d4c9f0e0e72f4eccf10756d0e53',
        addressesInvolved: [],
      },
    ];
    expect(result).toHaveLength(2);
    expect(result).toEqual(expectedAlerts);
  });

  it('should not generate any alerts for transactions not involving large stake', async () => {
    const blockInfo = { network: 'osmosis-1', height: '11745609' };
    const mockRule: IRangeAlertRule = {
      ruleType: 'LargeStake',
      id: '123',
      createdAt: new Date(),
      parameters: null,
    };

    const result = await testRangeSDK.assertRule(blockInfo, mockRule);
    expect(result).toHaveLength(0);
  });
});
