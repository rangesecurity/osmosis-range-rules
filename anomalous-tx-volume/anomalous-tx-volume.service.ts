import { Injectable } from '@nestjs/common';
import {
  OnBlock,
  IRangeBlock,
  IRangeAlertRule,
  ISubEvent,
  Osmosis1TrxMsgTypes,
} from '@range-security/range-sdk';
import ARIMA from 'arima';

// Define SARIMA settings
const SARIMA_SETTINGS = {
  p: 2,
  d: 1,
  q: 2,
  P: 1,
  D: 0,
  Q: 1,
  s: 50,
  verbose: false,
};

// Initialize SARIMA models for each monitored contract
const contractTracker: Record<string, any> = {};

@Injectable()
export class AnomalousTxVolumeService implements OnBlock {
  constructor() {
    // Example: Initialize SARIMA for a specific contract address
    const exampleContractAddress = '0x12345';
    this.initializeSARIMA(exampleContractAddress);
  }

  // Utility function to initialize a SARIMA model for a contract address
  initializeSARIMA(contractAddress: string) {
    contractTracker[contractAddress] = new ARIMA(SARIMA_SETTINGS);
  }

  callback: (
    block: IRangeBlock,
    rule: IRangeAlertRule,
  ) => Promise<ISubEvent[]> = async (block) => {
    const subEvents: ISubEvent[] = [];

    // Handle each transaction in the block
    for (const trx of block.transactions) {
      for (const msg of trx.messages) {
        if (msg.type === Osmosis1TrxMsgTypes.CosmwasmWasmV1MsgExecuteContract) {
          // Check if the transaction is related to a monitored contract
          const contractAddress = msg.data.contract;
          if (contractAddress && contractTracker[contractAddress]) {
            const tracker = contractTracker[contractAddress];

            // Update transaction counts based on transaction type (e.g., successful transactions)
            // You will need to customize this logic based on your data structure
            const isSuccessful = trx.success; // Check the actual field for transaction status
            if (isSuccessful) {
              tracker.addObservation(1); // Increase count for successful transactions
            } else {
              tracker.addObservation(0); // Increase count for failed transactions
            }

            // Predict transaction counts for the next block
            const [prediction] = tracker.predict(1);

            // Compare the prediction to the expected baseline
            const currentCount = tracker.getObservations().slice(-1)[0]; // Get the latest count
            const baseline = tracker.getObservations().slice(-2, -1)[0]; // Get the previous count

            // Customize this threshold based on your desired sensitivity
            const threshold = 1.96 * Math.sqrt(prediction.variance);

            // Check if the current count is significantly different from the expected baseline
            if (Math.abs(currentCount - baseline) > threshold) {
              // Anomaly detected, create an alert
              const subEvent: ISubEvent & { details: any } = {
                details: {
                  message: `Anomaly detected in transactions for contract ${contractAddress}`,
                  currentCount,
                  baseline,
                },
                txHash: '',
                addressesInvolved: [contractAddress],
                severity: 'medium',
                caption: 'Anomalous transaction volume detected for a contract',
              };
              subEvents.push(subEvent);
            }
          }
        }
      }
    }

    return subEvents;
  };
}
