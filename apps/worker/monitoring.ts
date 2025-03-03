import { 
    CloudWatchClient, 
    PutMetricDataCommand, 
    type PutMetricDataCommandInput,
    type MetricDatum
  } from "@aws-sdk/client-cloudwatch";
  import winston from "winston";
  
  export const cloudwatch = new CloudWatchClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/app.log' })
    ]
  });
  
 
  export interface MetricData extends Omit<MetricDatum, 'Timestamp'> {
    timestamp?: Date;
  }
  
  export const metrics = {
    putMetricData: async (params: PutMetricDataCommandInput) => {
      try {
        const command = new PutMetricDataCommand(params);
        await cloudwatch.send(command);
      } catch (error) {
        logger.error('Metrics submission failed', { error });
      }
    }
  };
  
  
  export interface HealthData {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    timestamp: Date;
  }
  
  export type HealthStatus = HealthData['status'];
  const metricData: MetricData = {
    MetricName: 'APIRequests',
    Value: 1,
    Unit: 'Count',

  };
  
  metrics.putMetricData({
    Namespace: 'MyApp',
    MetricData: [metricData]
  });
  
  const healthCheck: HealthData = {
    status: 'healthy',
    timestamp: new Date(),
    message: 'All systems operational'
  };
  
  const currentStatus: HealthStatus = healthCheck.status;