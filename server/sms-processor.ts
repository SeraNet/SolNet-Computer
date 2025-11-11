import { db } from './db';
import { smsQueue } from '@shared/schema';
import { eq, and, lt, sql } from 'drizzle-orm';
import { logger } from './utils/logger';

/**
 * SMS Processor - Background service for reliable SMS delivery
 * Processes queued SMS messages with retry mechanism
 */
export class SMSProcessor {
  private isProcessing = false;
  private intervalId?: NodeJS.Timeout;
  private smsService: any;

  constructor() {
    // Dynamically import SMS service to avoid circular dependencies
    import('./sms-service').then(module => {
      this.smsService = module;
    });
  }

  /**
   * Start the SMS processor with specified interval
   * @param intervalMs - Processing interval in milliseconds (default: 30 seconds)
   */
  start(intervalMs: number = 30000) {
    logger.info('Starting SMS processor', { intervalMs });
    
    this.intervalId = setInterval(() => {
      this.processPendingSMS();
    }, intervalMs);

    // Process immediately on start
    this.processPendingSMS();
  }

  /**
   * Stop the SMS processor
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      logger.info('SMS processor stopped');
    }
  }

  /**
   * Process all pending SMS in the queue
   */
  private async processPendingSMS() {
    if (this.isProcessing) {
      logger.debug('SMS processor already running, skipping');
      return;
    }

    if (!this.smsService) {
      logger.debug('SMS service not initialized yet, skipping');
      return;
    }

    this.isProcessing = true;

    try {
      // Get pending SMS that haven't exceeded max attempts
      const pendingSMS = await db
        .select()
        .from(smsQueue)
        .where(
          and(
            eq(smsQueue.status, 'pending'),
            sql`${smsQueue.attempts} < ${smsQueue.maxAttempts}`
          )
        )
        .orderBy(smsQueue.createdAt)
        .limit(10); // Process 10 at a time

      if (pendingSMS.length > 0) {
        logger.info(`Processing ${pendingSMS.length} pending SMS messages`);

        for (const sms of pendingSMS) {
          await this.processSingleSMS(sms);
        }
      }
    } catch (error) {
      logger.error('Error in SMS processor', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single SMS message
   */
  private async processSingleSMS(sms: any) {
    try {
      // Attempt to send via SMS service
      if (this.smsService?.sendSMS) {
        await this.smsService.sendSMS(sms.phone, sms.message);
      } else {
        throw new Error('SMS service not available');
      }

      // Mark as sent
      await db
        .update(smsQueue)
        .set({
          status: 'sent',
          sentAt: new Date(),
          lastAttemptAt: new Date(),
        })
        .where(eq(smsQueue.id, sms.id));

      logger.info('SMS sent successfully', {
        smsId: sms.id,
        phone: sms.phone,
        type: sms.type,
        attempts: sms.attempts + 1,
      });
    } catch (error) {
      const attempts = sms.attempts + 1;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Determine if this was the last attempt
      const newStatus = attempts >= sms.maxAttempts ? 'failed' : 'pending';

      // Update attempt count and error
      await db
        .update(smsQueue)
        .set({
          attempts,
          lastAttemptAt: new Date(),
          errorMessage,
          status: newStatus,
        })
        .where(eq(smsQueue.id, sms.id));

      if (newStatus === 'failed') {
        logger.error('SMS delivery failed - max attempts reached', {
          smsId: sms.id,
          phone: sms.phone,
          type: sms.type,
          attempts,
          maxAttempts: sms.maxAttempts,
          error: errorMessage,
        });
      } else {
        logger.warn('SMS send failed, will retry', {
          smsId: sms.id,
          phone: sms.phone,
          attempts,
          maxAttempts: sms.maxAttempts,
          error: errorMessage,
        });
      }
    }
  }

  /**
   * Manually retry a specific SMS
   * Used by admin interface
   */
  async retrySMS(smsId: string) {
    const [sms] = await db
      .select()
      .from(smsQueue)
      .where(eq(smsQueue.id, smsId));

    if (!sms) {
      throw new Error('SMS not found');
    }

    // Reset attempts and status
    await db
      .update(smsQueue)
      .set({
        attempts: 0,
        status: 'pending',
        errorMessage: null,
      })
      .where(eq(smsQueue.id, smsId));

    logger.info('SMS retry initiated', { smsId, phone: sms.phone });

    // Process immediately
    await this.processSingleSMS({ ...sms, attempts: 0 });
  }

  /**
   * Get SMS queue statistics
   */
  async getQueueStats() {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) as total
      FROM ${smsQueue}
    `);

    return stats.rows[0] || { pending: 0, sent: 0, failed: 0, cancelled: 0, total: 0 };
  }
}

export const smsProcessor = new SMSProcessor();

