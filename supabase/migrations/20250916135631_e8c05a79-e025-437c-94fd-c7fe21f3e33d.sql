-- Create storage bucket for digital signed documents
INSERT INTO storage.buckets (id, name, public) VALUES ('signed-documents', 'signed-documents', true);

-- Create policies for signed documents bucket
CREATE POLICY "Employees can view signed documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'signed-documents');

CREATE POLICY "Employees can upload signed documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'signed-documents');

CREATE POLICY "Employees can update signed documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'signed-documents');