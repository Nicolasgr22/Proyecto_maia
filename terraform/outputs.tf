output "iam_user_arn" {
  description = "ARN del usuario IAM"
  value       = aws_iam_user.maia_user.arn
}

output "iam_role_arn" {
  description = "ARN del role maia-proyecto-grado"
  value       = aws_iam_role.maia_proyecto_grado.arn
}

output "iam_user_access_key_id" {
  description = "Access key ID del usuario (usar con sts:AssumeRole)"
  value       = aws_iam_access_key.maia_user_key.id
  sensitive   = false
}

output "iam_user_secret_access_key" {
  description = "Secret access key del usuario — guardar en lugar seguro"
  value       = aws_iam_access_key.maia_user_key.secret
  sensitive   = true
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 del proyecto"
  value       = aws_s3_bucket.maia_proyecto_final.bucket
}

output "s3_bucket_arn" {
  description = "ARN del bucket S3 del proyecto"
  value       = aws_s3_bucket.maia_proyecto_final.arn
}

output "sagemaker_role_arn" {
  description = "ARN del role maia-proyecto-grado (execution role de SageMaker — el mismo role)"
  value       = aws_iam_role.maia_proyecto_grado.arn
}
