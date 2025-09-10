# gcloud functions deploy process_invoice_text \
#   --runtime python311 \
#   --trigger-http \
#   --allow-unauthenticated \
#   --entry-point process_invoice_text \
#   --region asia-southeast1 \
#   --set-env-vars 'GOOGLE_CLOUD_PROJECT_ID=sigma-lyceum-321504'

#   gcloud functions deploy process_bank_statement \
#   --runtime python311 \
#   --trigger-http \
#   --allow-unauthenticated \
#   --entry-point process_bank_statement \
#   --region asia-southeast1 \
#   --set-env-vars 'GOOGLE_CLOUD_PROJECT_ID=sigma-lyceum-321504'

gcloud functions deploy accounting-ai-api \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point app \
  --region asia-southeast1 \
  --set-env-vars 'GOOGLE_CLOUD_PROJECT_ID=sigma-lyceum-321504'