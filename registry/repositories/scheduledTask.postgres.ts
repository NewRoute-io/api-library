import { QueryConfig } from "pg";
import { ScheduledTaskRepository, Task } from "./scheduledTask.interface.js";
import { pgPool } from "@/repositories/connection.postgres.js";

export const createScheduledTaskRepository = (): ScheduledTaskRepository => {
  const rowMapper = (result: any): Task => {
    return {
      id: result.id,
      type: result.type,
      payload: result.payload,
      status: result.status,
      retries: result.retries,
      version: result.version,
      runAfter: result.run_after,
      lastAttemptTime: result.last_attempt_time,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  };

  return {
    getTaskById: async (taskId: number) => {
      const query: QueryConfig = {
        name: "getTaskById",
        text: `
              SELECT 
                id,
                type,
                payload,
                status,
                retries,
                version,
                run_after,
                last_attempt_time,
                next_retry_time,
                created_at,
                updated_at
            FROM tasks
            WHERE id = $1;
          `,
        values: [taskId],
      };
      const result = await pgPool.query(query).then((data) => data.rows.at(0));

      if (result) {
        return rowMapper(result);
      } else return null;
    },
    saveTask: async (task: Task) => {
      const query: QueryConfig = {
        name: "saveTask",
        text: `INSERT INTO tasks (
                    type, 
                    payload, 
                    status, 
                    retries, 
                    version, 
                    run_after, 
                    last_attempt_time, 
                    next_retry_time, 
                    created_at, 
                    updated_at
                ) VALUES (
                    $1, 
                    $2, 
                    $3, 
                    $4, 
                    $5, 
                    $6, 
                    $7, 
                    $8, 
                    NOW(), 
                    NOW()
                )
                RETURNING id,
                    type,
                    payload,
                    status,
                    retries,
                    version,
                    run_after,
                    last_attempt_time,
                    next_retry_time,
                    created_at,
                    updated_at;`,
        values: [
          task.type,
          task.payload,
          task.status,
          task.retries,
          task.version,
          task.runAfter,
          task.lastAttemptTime,
          task.nextRetryTime,
        ],
      };

      const result = await pgPool.query(query).then((data) => data.rows.at(0));
      return rowMapper(result);
    },
    updateTask: async (task: Task) => {
      const query: QueryConfig = {
        name: "updateTask",
        text: `
        UPDATE tasks
        SET 
            type = $1,
            payload = $2,
            status = $3,
            retries = $4,
            version = version + 1, -- Increment version for optimistic locking
            run_after = $5,
            last_attempt_time = $6,
            next_retry_time = $7,
            updated_at = NOW()
        WHERE id = $8 AND version = $9 -- Ensure optimistic locking
        RETURNING id,
                    type,
                    payload,
                    status,
                    retries,
                    version,
                    run_after,
                    last_attempt_time,
                    next_retry_time,
                    created_at,
                    updated_at;
      `,
        values: [
          task.type,
          task.payload,
          task.status,
          task.retries,
          task.runAfter,
          task.lastAttemptTime,
          task.nextRetryTime,
          task.id,
          task.version,
        ],
      };

      const result = await pgPool.query(query).then((data) => data.rows.at(0));

      if (result == null) {
        throw Error("Update failed");
      }
      return rowMapper(result);
    },
    submitTasks: (limit: number) => {
      const query: QueryConfig = {
        name: "submittedTasks",
        text: `
            WITH tasks_for_submission AS (
                SELECT id, version FROM tasks WHERE
      (status = 'PROCESSING' AND last_attempt_time IS NOT NULL AND last_attempt_time < NOW() - interval '2' second) OR
                (status = 'WAITING' AND (
                (run_after < NOW() AND next_retry_time IS NULL) OR
                (next_retry_time IS NOT NULL AND next_retry_time < NOW())
                )) ORDER BY COALESCE(next_retry_time, run_after) ASC LIMIT $1
            )
            UPDATE tasks SET  
                version = tasks.version + 1,
                status = 'SUBMITTED'
            FROM tasks_for_submission WHERE tasks_for_submission.id = tasks.id AND tasks_for_submission.version = tasks.version
            RETURNING tasks.id as id,
                    type,
                    payload,
                    status,
                    retries,
                    tasks.version as version,
                    run_after,
                    last_attempt_time,
                    next_retry_time,
                    created_at,
                    updated_at;
          `,
        values: [limit],
      };

      return pgPool.query(query).then((data) => data.rows.map(rowMapper));
    },
  };
};
