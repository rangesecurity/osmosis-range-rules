import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsg,
  Osmosis1TrxMsgTypes,
  Osmosis1TrxMsgCosmwasmWasmV1MsgUpdateAdmin,
} from '@range-security/range-sdk';

@Injectable()
export class ContractAdminUpdateService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const allMessages: Osmosis1TrxMsg[] = block.transactions.flatMap(
      (tx) => tx.messages,
    );
    const targetMessages = allMessages.filter((m) => {
      return m.type === Osmosis1TrxMsgTypes.CosmwasmWasmV1MsgUpdateAdmin;
    }) as Osmosis1TrxMsgCosmwasmWasmV1MsgUpdateAdmin[];

    const results: ISubEvent[] = targetMessages.map((m) => ({
      details: {
        message: `Cosmwasm contract admin updated to ${m.data.new_admin} by ${m.data.sender} for contract ${m.data.contract}`,
      },
      txHash: m.tx_hash,
      addressesInvolved: m.addresses,
      severity: 'high',
      caption: 'Contract admin updated',
    }));

    return results;
  };
}
