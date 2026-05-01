# ─────────────────────────────────────────────
# IAM User — solo puede asumir el role
# ─────────────────────────────────────────────
resource "aws_iam_user" "maia_user" {
  name = var.iam_user_name
  path = "/maia/"

  tags = {
    Project = "maia-proyecto-final"
  }
}

resource "aws_iam_user_policy" "maia_user_assume_role" {
  name = "maia-assume-role-only"
  user = aws_iam_user.maia_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "AllowAssumeRoleMaiaProyectoGrado"
        Effect   = "Allow"
        Action   = "sts:AssumeRole"
        Resource = "arn:aws:iam::${var.aws_account_id}:role/${var.iam_role_name}"
      }
    ]
  })
}

resource "aws_iam_access_key" "maia_user_key" {
  user = aws_iam_user.maia_user.name
}

# ─────────────────────────────────────────────
# IAM Role — permisos de escritura en S3
# ─────────────────────────────────────────────
resource "aws_iam_role" "maia_proyecto_grado" {
  name        = var.iam_role_name
  description = "Role con permisos de escritura para el proyecto de grado MaIA"
  path        = "/maia/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowMaiaUserToAssume"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_user.maia_user.arn
        }
        Action = "sts:AssumeRole"
      },
      {
        Sid    = "AllowSageMakerToAssume"
        Effect = "Allow"
        Principal = {
          Service = "sagemaker.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Project = "maia-proyecto-final"
  }
}

resource "aws_iam_role_policy" "maia_role_s3" {
  name = "maia-s3-write-policy"
  role = aws_iam_role.maia_proyecto_grado.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListBucket"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation",
          "s3:ListBucketMultipartUploads"
        ]
        Resource = "arn:aws:s3:::${var.bucket_name}"
      },
      {
        Sid    = "ReadWriteObjects"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:AbortMultipartUpload",
          "s3:ListMultipartUploadParts"
        ]
        Resource = "arn:aws:s3:::${var.bucket_name}/*"
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/sagemaker/*"
      },
      {
        Sid    = "ECRPull"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      },
      {
        Sid    = "SageMakerProcessingJobs"
        Effect = "Allow"
        Action = [
          "sagemaker:CreateProcessingJob",
          "sagemaker:DescribeProcessingJob",
          "sagemaker:StopProcessingJob",
          "sagemaker:ListProcessingJobs"
        ]
        Resource = "arn:aws:sagemaker:${var.aws_region}:${var.aws_account_id}:processing-job/*"
      },
      {
        Sid    = "PassRoleToSageMaker"
        Effect = "Allow"
        Action = "iam:PassRole"
        Resource = "arn:aws:iam::${var.aws_account_id}:role${aws_iam_role.maia_proyecto_grado.path}${aws_iam_role.maia_proyecto_grado.name}"
        Condition = {
          StringEquals = {
            "iam:PassedToService" = "sagemaker.amazonaws.com"
          }
        }
      }
    ]
  })
}
