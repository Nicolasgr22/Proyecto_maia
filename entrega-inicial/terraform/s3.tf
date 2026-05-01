# ─────────────────────────────────────────────
# S3 Bucket — recursos del proyecto
# ─────────────────────────────────────────────
resource "aws_s3_bucket" "maia_proyecto_final" {
  bucket = var.bucket_name

  tags = {
    Project = "maia-proyecto-final"
  }
}

resource "aws_s3_bucket_public_access_block" "maia_proyecto_final" {
  bucket = aws_s3_bucket.maia_proyecto_final.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "maia_proyecto_final" {
  bucket = aws_s3_bucket.maia_proyecto_final.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
