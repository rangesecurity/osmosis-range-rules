import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsg,
  Osmosis1TrxMsgTypes,
  Osmosis1TrxMsgCosmosStakingV1beta1MsgCreateValidator,
} from '@range-security/range-sdk';

@Injectable()
export class NewValidatorCreatedService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const allMessages: Osmosis1TrxMsg[] = block.transactions.flatMap(
      (tx) => tx.messages,
    );
    const targetMessages = allMessages.filter((m) => {
      return (
        m.type === Osmosis1TrxMsgTypes.CosmosStakingV1beta1MsgCreateValidator
      );
    }) as Osmosis1TrxMsgCosmosStakingV1beta1MsgCreateValidator[];

    const results: ISubEvent[] = targetMessages.map((m) => {
      const { data } = m;
      return {
        details: {
          message: `A new validator is created with validator address: ${data.validatorAddress} by ${data.delegatorAddress}`,
        },
        txHash: m.tx_hash,
        addressesInvolved: m.addresses,
        caption: 'New validator created',
      };
    });

    return results;
  };
}
