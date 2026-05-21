CREATE TABLE IF NOT EXISTS schedule_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('task', 'reminder', 'event')),
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_events_user_id ON schedule_events (user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_user_date ON schedule_events (user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_course_id ON schedule_events (course_id);
