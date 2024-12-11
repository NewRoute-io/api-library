CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,                     -- Unique identifier for each task
    type VARCHAR(255) NOT NULL,                -- The type of the task (e.g., "email", "report")
    payload JSONB NOT NULL,                    -- Payload data for the task in JSON format
    status VARCHAR(50) NOT NULL,               -- Task status: PENDING, IN_PROGRESS, DONE, FAILED
    retries INT NOT NULL DEFAULT 0,            -- Number of retry attempts
    version INT NOT NULL DEFAULT 0,            -- Optimistic locking version for concurrency
    run_after TIMESTAMP,                       -- When the task is scheduled to run
    last_attempt_time TIMESTAMP,               -- Timestamp of the last attempt
    next_retry_time TIMESTAMP,                 -- Timestamp for the next retry attempt
    created_at TIMESTAMP NOT NULL DEFAULT NOW(), -- When the task was created
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() -- When the task was last updated
);

-- Indexes for performance
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_run_after ON tasks (run_after);
CREATE INDEX idx_tasks_next_retry_time ON tasks (next_retry_time);
CREATE INDEX idx_tasks_last_attempt_time ON tasks (last_attempt_time);