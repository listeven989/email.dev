To add an `archive` column to both the `campaigns` and `email_templates` tables, you can use the following SQL code:

```sql
-- Add archive column to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'archive') THEN
    ALTER TABLE campaigns
    ADD COLUMN archive BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- Add archive column to email_templates table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'archive') THEN
    ALTER TABLE email_templates
    ADD COLUMN archive BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;
```

This code will add an `archive` column to both tables with a boolean data type and a default value of `FALSE`.