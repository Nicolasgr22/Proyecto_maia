variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
  default     = "673857242697"
}

variable "bucket_name" {
  description = "S3 bucket for project resources"
  type        = string
  default     = "maia-proyecto-final"
}

variable "iam_user_name" {
  description = "IAM user with assume-role-only permissions"
  type        = string
  default     = "maia-proyecto-user"
}

variable "iam_role_name" {
  description = "IAM role with write permissions"
  type        = string
  default     = "maia-proyecto-grado"
}
