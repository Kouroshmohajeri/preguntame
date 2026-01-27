import { enhancedEmailService } from "./enhancedEmailService.js";
import User from "../models/User.js";

interface ScheduledReminder {
  email: string;
  name: string;
  requestTime: string;
  scheduledFor: Date;
}

class BetaAccessScheduler {
  private reminders: Map<string, NodeJS.Timeout> = new Map();

  scheduleReminder(email: string, name: string, requestTime: string) {
    // Cancel existing reminder if any
    this.cancelReminder(email);

    // Schedule new reminder for 2 hours
    const timeoutId = setTimeout(
      async () => {
        await this.sendReminder(email, name, requestTime);
        this.reminders.delete(email);
      },
      2 * 60 * 60 * 1000,
    ); // 2 hours

    this.reminders.set(email, timeoutId);

    console.log(`✅ Reminder scheduled for ${email} in 2 hours`);
  }

  async sendReminder(email: string, name: string, requestTime: string) {
    try {
      // Check if still pending
      const user = await User.findOne({ email });

      if (!user?.hasBetaAccess) {
        await enhancedEmailService.sendAdminBetaReminder(
          email,
          name,
          requestTime,
        );
        console.log(`📧 Reminder sent for ${email}`);
      } else {
        console.log(
          `✅ User ${email} already has beta access, reminder cancelled`,
        );
      }
    } catch (error) {
      console.error(`❌ Failed to send reminder for ${email}:`, error);
    }
  }

  cancelReminder(email: string) {
    const timeoutId = this.reminders.get(email);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.reminders.delete(email);
      console.log(`🚫 Reminder cancelled for ${email}`);
    }
  }

  // Call this when admin approves beta access
  cancelReminderOnApproval(email: string) {
    this.cancelReminder(email);
  }
}

export const betaAccessScheduler = new BetaAccessScheduler();
