
-- Step 1: Drop the existing CHECK constraint on resource_type in teaching_resources
ALTER TABLE public.teaching_resources
DROP CONSTRAINT teaching_resources_resource_type_check;

-- Step 2: Add a new CHECK constraint to include 'ppt_outline'
ALTER TABLE public.teaching_resources
ADD CONSTRAINT teaching_resources_resource_type_check
CHECK (resource_type IN ('lesson_plan', 'image', 'ppt_outline'));

-- Step 3: Drop the existing foreign key constraint on messages.lesson_plan_id
ALTER TABLE public.messages
DROP CONSTRAINT fk_lesson_plan;

-- Step 4: Rename the column from lesson_plan_id to resource_id
ALTER TABLE public.messages
RENAME COLUMN lesson_plan_id TO resource_id;

-- Step 5: Add a new foreign key constraint on the renamed column
ALTER TABLE public.messages
ADD CONSTRAINT fk_resource_id
FOREIGN KEY (resource_id)
REFERENCES public.teaching_resources(id) ON DELETE SET NULL;
