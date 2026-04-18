import cron from 'node-cron';
import Assignment from '../models/Assignment.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket/socketHandler.js';

/**
 * Starts a cron job that runs every hour and sends deadline warnings
 * to students whose assignments are due within the next 24 hours.
 */
const startDeadlineNotifier = () => {
  // Run every hour: "0 * * * *"
  cron.schedule('0 * * * *', async () => {
    console.log('[DeadlineNotifier] Running deadline check...');

    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find assignments whose deadline falls within the next 24 hours
      const upcomingAssignments = await Assignment.find({
        deadline: { $gte: now, $lte: in24h },
      });

      const io = getIO();

      for (const assignment of upcomingAssignments) {
        for (const studentId of assignment.assignedTo) {
          // Check if a deadline_warning notification already exists in the last 24h
          // for this exact student + assignment pair
          const existing = await Notification.findOne({
            recipientId: studentId,
            relatedAssignmentId: assignment._id,
            type: 'deadline_warning',
            createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          });

          if (!existing) {
            const notification = await Notification.create({
              recipientId: studentId,
              recipientRole: 'student',
              message: `Deadline reminder: "${assignment.title}" is due within 24 hours.`,
              type: 'deadline_warning',
              relatedAssignmentId: assignment._id,
            });

            // Emit real-time notification to the student's room
            io.to(`student_${studentId}`).emit('deadline_warning', {
              notification,
              assignmentId: assignment._id,
              title: assignment.title,
              deadline: assignment.deadline,
            });

            console.log(
              `[DeadlineNotifier] Sent warning to student ${studentId} for "${assignment.title}"`
            );
          }
        }
      }
    } catch (err) {
      console.error('[DeadlineNotifier] Error:', err.message);
    }
  });

  console.log('[DeadlineNotifier] Scheduled — runs every hour.');
};

export { startDeadlineNotifier };
