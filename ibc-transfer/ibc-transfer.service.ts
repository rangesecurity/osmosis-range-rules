import { Injectable } from '@nestjs/common';
import {
  IRangeAlertRule,
  IRangeBlock,
  ISubEvent,
  OnBlock,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';
import {
  RULES_TYPES,
  listTagsAndAddresses,
} from '../../utils/format-alert-title';
import { getBiOperator } from '../../operators/BiOperator';
import { IBCTransferParam } from './params';

@Injectable()
export class IbcTransferService implements OnBlock {
  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block, rule) => {
    const parameters: IBCTransferParam = rule.parameters as IBCTransferParam;
    const addressesSet = new Set<string>(parameters.addresses);

    const results: ISubEvent[] = [];

    for (const tx of block.transactions) {
      for (const msg of tx.messages) {
        if (!msg.addresses.some((address) => addressesSet.has(address)))
          continue;

        // Match SENT IBC transfers
        if (
          msg.type ===
            Osmosis1TrxMsgTypes.IbcApplicationsTransferV1MsgTransfer &&
          parameters.direction === 'sent'
        ) {
          if (msg.data.token.denom !== parameters.denom) continue;

          const amount = Number(msg.data.token?.amount) || 0;
          const operator = parameters.comparator
            ? getBiOperator(parameters.comparator)
            : null;
          const thresholdValue = (parameters.thresholdValue || 0) * 1000000;
          const compareResult = operator?.apply(amount, thresholdValue) || true;

          if (!compareResult) continue;

          results.push({
            addressesInvolved: msg.addresses,
            txHash: msg.tx_hash,
            details: {
              message: this.formatAlertMessage(rule, {
                // amount: formatAmount(msg.data.token),
                amount,
                sender: msg.data.sender,
                receiver: msg.data.receiver,
                involvedAddresses: msg.addresses.filter((a: string) =>
                  addressesSet.has(a),
                ),
              }),
            },
            caption: 'IBC Transfer',
          });
        }

        // Match RECEIVE IBC transfers
        if (
          msg.type === Osmosis1TrxMsgTypes.IbcCoreChannelV1MsgRecvPacket &&
          parameters.direction === 'received'
        ) {
          const packet: {
            sender: string;
            receiver: string;
            denom: string;
            amount: string;
          } = JSON.parse(
            Buffer.from(msg.data.packet.data, 'base64').toString(),
          );

          if (packet.denom !== parameters.denom) continue;

          const amount = Number(packet.amount) || 0;
          const operator = parameters.comparator
            ? getBiOperator(parameters.comparator)
            : null;
          const thresholdValue = (parameters.thresholdValue || 0) * 1000000;
          const compareResult = operator?.apply(amount, thresholdValue) || true;

          if (!compareResult) continue;

          results.push({
            addressesInvolved: msg.addresses,
            txHash: msg.tx_hash,
            details: {
              message: this.formatAlertMessage(rule, {
                // amount: formatAmount(msg.data.packet),
                amount: packet.amount,
                sender: packet.sender,
                receiver: packet.receiver,
                involvedAddresses: msg.addresses.filter((a: string) =>
                  addressesSet.has(a),
                ),
              }),
            },
            caption: 'IBC Transfer',
          });
        }
      }
    }

    return results;
  };

  private formatAlertMessage(rule: IRangeAlertRule, details?: any): string {
    const { ruleType, parameters } = rule;
    const { target, comparator, thresholdValue } = parameters;
    return (
      `${RULES_TYPES[ruleType]} detected for: ${details.involvedAddresses}\n` +
      `This activity is associated with the following ${target}: ${listTagsAndAddresses(
        parameters,
      )}\n` +
      `An amount of ${details.amount} is transferred from ${details.sender} to ${details.receiver}\n` +
      (comparator !== '' ? `which is ${comparator} ${thresholdValue}` : '')
    );
  }
}
