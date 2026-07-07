import cron from 'node-cron';
import { Op } from 'sequelize';
import { Service, User, SystemSetting, AuditLog } from '../models/index.js';
import { dispatchLifecycleNotification } from '../utils/notificationEngine.js';

export const startSubscriptionEngine = () => {
  // Run every day at 00:01
  cron.schedule('1 0 * * *', async () => {
    console.log('[Subscription Engine] Starting daily subscription lifecycle check...');
    await runSubscriptionCheck();
  });
};

export const runSubscriptionCheck = async () => {
  try {
    // 1. Fetch Grace Period Setting
    let gracePeriodSetting = await SystemSetting.findOne({ where: { key: 'GRACE_PERIOD_DAYS' } });
    const GRACE_PERIOD_DAYS = gracePeriodSetting ? parseInt(gracePeriodSetting.value, 10) : 7;

    // 2. Fetch all Active, Pending Payment, or Expired Services (we don't check already Cancelled or Suspended for expiration)
    const services = await Service.findAll({
      where: {
        status: {
          [Op.in]: ['Active', 'Expired']
        }
      },
      include: [
        { model: User, as: 'user' }
      ]
    });

    console.log(`[Subscription Engine] Found ${services.length} services to evaluate.`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const service of services) {
      if (!service.next_due_date || !service.user) continue;

      const dueDate = new Date(service.next_due_date);
      dueDate.setHours(0, 0, 0, 0);

      // Calculate diff in days (Positive = Future/Remaining, Negative = Past/Overdue)
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Notification Logic
      if (diffDays === 30) {
        await dispatchLifecycleNotification(service.user, service, '30_days', 30);
      } else if (diffDays === 15) {
        await dispatchLifecycleNotification(service.user, service, '15_days', 15);
      } else if (diffDays === 7) {
        await dispatchLifecycleNotification(service.user, service, '7_days', 7);
      } else if (diffDays === 3) {
        await dispatchLifecycleNotification(service.user, service, '3_days', 3);
      } else if (diffDays === 1) {
        await dispatchLifecycleNotification(service.user, service, '1_day', 1);
      } else if (diffDays === 0) {
        if (service.status !== 'Expired') {
          service.status = 'Expired'; // Enter grace period
          await service.save();
        }
        await dispatchLifecycleNotification(service.user, service, '0_days', 0);
      } 
      // Grace Period Logic
      else if (diffDays < 0) {
        const daysOverdue = Math.abs(diffDays);

        if (daysOverdue === GRACE_PERIOD_DAYS - 1) {
          // 1 day before suspension
          await dispatchLifecycleNotification(service.user, service, 'grace_warning', 0);
        } else if (daysOverdue > GRACE_PERIOD_DAYS) {
          // Suspend Server
          if (service.status !== 'Suspended') {
            const oldStatus = service.status;
            service.status = 'Suspended';
            await service.save();

            await AuditLog.create({
              action: 'Automated Server Suspension',
              target_user_id: service.user.id,
              entity_type: 'Service',
              entity_id: service.id,
              details: { reason: 'Grace period expired', overdue_days: daysOverdue, old_status: oldStatus }
            });

            await dispatchLifecycleNotification(service.user, service, 'suspended', 0);
            console.log(`[Subscription Engine] Suspended service ${service.id} (Overdue by ${daysOverdue} days)`);
          }
        }
      }
    }

    console.log('[Subscription Engine] Daily check completed successfully.');
  } catch (error) {
    console.error('[Subscription Engine] Error running daily check:', error);
  }
};
