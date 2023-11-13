import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsg,
  Osmosis1TrxMsgTypes,
  Osmosis1TrxMsgCosmwasmWasmV1MsgInstantiateContract,
} from '@range-security/range-sdk';

@Injectable()
export class ContractInstantiationService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block, rule) => {
    const p = rule.parameters as { code_ids: string[] };

    const allMessages: Osmosis1TrxMsg[] = block.transactions.flatMap(
      (tx) => tx.messages,
    );

    const targetMessages = allMessages.filter((m) => {
      if (m.type != Osmosis1TrxMsgTypes.CosmwasmWasmV1MsgInstantiateContract) {
        return false;
      }
      const { data } = m;

      if (p.code_ids.length == 0) {
        return true;
      }

      return p.code_ids.includes(data.codeId);
    }) as Osmosis1TrxMsgCosmwasmWasmV1MsgInstantiateContract[];

    const results: ISubEvent[] = targetMessages.map((m) => {
      const { data } = m;
      return {
        details: {
          message: 'Cosmwasm contract instantiated for code id: ' + data.codeId,
        },
        txHash: m.tx_hash,
        addressesInvolved: m.addresses,
        severity: 'low',
        caption: 'New contract instantiated',
      };
    });

    return results;
  };
}
