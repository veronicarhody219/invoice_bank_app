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

# gcloud functions deploy accounting-ai-api \
#   --runtime python311 \
#   --trigger-http \
#   --allow-unauthenticated \
#   --entry-point app \
#   --region asia-southeast1 \
#   --set-env-vars 'GOOGLE_CLOUD_PROJECT_ID=sigma-lyceum-321504'

# gcloud run deploy accounting-ai-api \
#   --source=. \
#   --allow-unauthenticated \
#   --region asia-southeast1 \
#   --set-env-vars 'GOOGLE_CLOUD_PROJECT_ID=sigma-lyceum-321504'
#   gcloud run deploy accounting-ai-api \
#   --source=. \
#   --region asia-southeast1 \
#   --set-env-vars 'GOOGLE_CLOUD_PROJECT_ID=sigma-lyceum-321504'


#   gcloud run services add-iam-policy-binding accounting-ai-api \
#   --member=serviceAccount:sigma-lyceum-321504@appspot.gserviceaccount.com \
#   --role=roles/run.invoker \
#   --region=asia-southeast1

# gcloud run deploy accounting-ai-api \
#   --source=. \
#   --allow-unauthenticated \
#   --region asia-southeast1 \
#   --set-env-vars 'GOOGLE_CLOUD_PROJECT_ID=sigma-lyceum-321504'

  gcloud run deploy accounting-ai-api \
  --source=. \
  --allow-unauthenticated \
  --region us-central1 \
  --set-env-vars 'GOOGLE_CLOUD_PROJECT_ID=sigma-lyceum-321504'