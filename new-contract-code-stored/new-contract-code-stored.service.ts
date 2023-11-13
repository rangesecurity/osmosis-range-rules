import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsg,
  Osmosis1TrxMsgTypes,
  Osmosis1TrxMsgCosmwasmWasmV1MsgStoreCode,
} from '@range-security/range-sdk';

@Injectable()
export class NewContractCodeStoredService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const allMessages: Osmosis1TrxMsg[] = block.transactions.flatMap(
      (tx) => tx.messages,
    );

    const targetMessages = allMessages.filter((m) => {
      return m.type === Osmosis1TrxMsgTypes.CosmwasmWasmV1MsgStoreCode;
    }) as Osmosis1TrxMsgCosmwasmWasmV1MsgStoreCode[];

    const results: ISubEvent[] = targetMessages.map((m) => ({
      details: {
        message: `New CW contract code stored by ${m.data.sender}`,
      },
      txHash: m.tx_hash,
      addressesInvolved: m.addresses,
      severity: 'low',
      caption: 'New CW contract code stored',
    }));

    return results;
  };
}
