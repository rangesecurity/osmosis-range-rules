interface DataPoint {
  messageType: string;
  timestamp: Date;
  gasUsage: number;
}

export class GasUsageAnalyzer {
  data: Map<string, DataPoint[]> = new Map();

  constructor() {}

  addDataPoint(dataPoint: DataPoint) {
    if (!this.data.has(dataPoint.messageType)) {
      this.data.set(dataPoint.messageType, []);
    }
    this.data.get(dataPoint.messageType)!.push(dataPoint);
  }

  private calculateMovingAverage(messageType: string): number {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const filteredData = (this.data.get(messageType) || []).filter(
      (dp) => dp.timestamp >= sixMonthsAgo,
    );

    if (filteredData.length === 0) {
      return 0; // No data in the last 6 months
    }

    const average =
      filteredData.reduce((sum, dp) => sum + dp.gasUsage, 0) /
      filteredData.length;

    return average;
  }

  checkOutlier(dataPoint: DataPoint): boolean {
    const movingAverage = this.calculateMovingAverage(dataPoint.messageType);
    const now = new Date();

    // Check if the data point is older than 6 months
    if (dataPoint.timestamp < new Date(now.setMonth(now.getMonth() - 6))) {
      return false; // Older than 6 months, not considered an outlier
    }

    // Calculate the standard deviation and threshold
    const filteredData = this.data.get(dataPoint.messageType) || [];

    // Check if there are at least 10 data points for analysis
    if (filteredData.length < 10) {
      return false; // Not enough data for analysis
    }

    const windowSize = filteredData.length;
    const variance =
      filteredData.reduce(
        (sum, dp) => sum + Math.pow(dp.gasUsage - movingAverage, 2),
        0,
      ) / windowSize;
    const standardDeviation = Math.sqrt(variance);
    const threshold = 2 * standardDeviation;

    // Check if the data point is an outlier
    return Math.abs(dataPoint.gasUsage - movingAverage) > threshold; // Checking for values greater than twice the standard deviation
  }
}

// // Example usage
// const analyzer = new GasUsageAnalyzer();

// for (let i = 0; i < 10; i++) {
//   // Add data points
//   analyzer.addDataPoint({
//     messageType: 'A',
//     timestamp: new Date('2023-01-01'),
//     gasUsage: 3000000,
//   });
//   analyzer.addDataPoint({
//     messageType: 'A',
//     timestamp: new Date('2023-02-01'),
//     gasUsage: 4000000,
//   });
// }

// // Check for outliers
// const dataPointToCheck: DataPoint = {
//   messageType: 'A',
//   timestamp: new Date(),
//   gasUsage: 8000000,
// };

// const isOutlier = analyzer.checkOutlier(dataPointToCheck);
// console.log('Is the data point an outlier?', isOutlier);
