-- Create visitors table (migration from external testdata)
CREATE TABLE public.visitors (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_camera BIGINT,
  id_person BIGINT,
  visit_date TIMESTAMP WITH TIME ZONE,
  leave_date TIMESTAMP WITH TIME ZONE,
  age TEXT,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Public read access for analytics (visitor data is not personal)
CREATE POLICY "Anyone can view visitors"
  ON public.visitors FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert visitors"
  ON public.visitors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update visitors"
  ON public.visitors FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete visitors"
  ON public.visitors FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for common queries
CREATE INDEX idx_visitors_visit_date ON public.visitors(visit_date);
CREATE INDEX idx_visitors_camera ON public.visitors(id_camera);
CREATE INDEX idx_visitors_age ON public.visitors(age);
CREATE INDEX idx_visitors_gender ON public.visitors(gender);